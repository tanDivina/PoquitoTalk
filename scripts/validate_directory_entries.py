#!/usr/bin/env python3
"""
PoquitoTalk Directory Entry Validator & Provenance Linter
Validates Panama E.164 phone numbers, filters scraper noise/hallucinations,
and verifies required provenance fields.
"""

import re
import json
import sys
from datetime import datetime

VALID_SOURCES = {'google_maps', 'official_registry', 'notebook_lm', 'community_vouched'}
VALID_EMERGENCY_SHORTCODES = {'104', '103', '911', '108', '107', '*335', '335'}

NOISE_PATTERNS = [
    r'\blooking for\b',
    r'\banyone know\b',
    r'\bif local services\b',
    r'\blocal services\b',
    r'\bse busca\b',
    r'\bnecesito\b',
    r'\balguien sabe\b'
]

def validate_panama_phone(phone_str):
    """
    Validates and normalizes Panama phone numbers.
    Returns: (is_valid: bool, normalized_phone: str, phone_type: str, error_msg: str)
    """
    if not phone_str:
        return False, "", "empty", "Phone number is empty"
        
    cleaned = str(phone_str).strip()
    
    # Check 3-digit shortcode
    if cleaned in VALID_EMERGENCY_SHORTCODES:
        return True, cleaned, "shortcode", ""
        
    digits = re.sub(r'[^0-9]', '', cleaned)
    
    # If 7 digits (Panama landline: 757, 758, 2xx, 3xx, 8xx)
    if len(digits) == 7:
        first_digit = digits[0]
        if first_digit in ('2', '3', '7', '8'):
            formatted = f"+507 {digits[:3]}-{digits[3:]}"
            p_type = "bocas_landline" if digits[:3] in ('757', '758') else "panama_landline"
            return True, formatted, p_type, ""
            
    # If starts with 507, strip it to check local digits
    if digits.startswith('507') and len(digits) in (10, 11):
        local_digits = digits[3:]
    elif len(digits) in (7, 8):
        local_digits = digits
    else:
        return False, cleaned, "invalid_length", f"Unexpected length {len(digits)} digits"
        
    if len(local_digits) == 8:
        first_digit = local_digits[0]
        # Mobile / WhatsApp (Starts with 6)
        if first_digit == '6':
            formatted = f"+507 {local_digits[:4]}-{local_digits[4:]}"
            return True, formatted, "mobile_whatsapp", ""
        elif local_digits[:3] in ('757', '758', '750'):
            formatted = f"+507 {local_digits[:3]}-{local_digits[3:]}"
            return True, formatted, "bocas_landline", ""
        elif first_digit in ('2', '3', '7', '8', '9'):
            formatted = f"+507 {local_digits[:3]}-{local_digits[3:]}"
            return True, formatted, "panama_landline", ""
    elif len(local_digits) == 7 and local_digits[0] in ('2', '3', '7', '8'):
        formatted = f"+507 {local_digits[:3]}-{local_digits[3:]}"
        p_type = "bocas_landline" if local_digits[:3] in ('757', '758') else "panama_landline"
        return True, formatted, p_type, ""
        
    return False, cleaned, "unknown_prefix", f"Invalid Panama format for '{cleaned}'"

def validate_provider_entry(entry):
    """
    Validates a single provider dictionary.
    Returns: (is_valid: bool, issues: list, normalized_entry: dict)
    """
    issues = []
    norm = dict(entry)
    
    name = entry.get('name', '').strip()
    if not name:
        issues.append("Missing 'name'")
    else:
        norm['name'] = name
        # Check noise patterns
        for pat in NOISE_PATTERNS:
            if re.search(pat, name, re.IGNORECASE):
                issues.append(f"Name contains scraper noise pattern: '{pat}'")
                
    # Check phone
    phone = entry.get('whatsappNumber') or entry.get('phone') or entry.get('phoneNumber')
    if not phone:
        issues.append("Missing phone / whatsappNumber")
    else:
        is_phone_valid, norm_phone, p_type, p_err = validate_panama_phone(phone)
        if not is_phone_valid:
            issues.append(f"Invalid Panama phone '{phone}': {p_err}")
        else:
            norm['phone'] = norm_phone
            if p_type == 'mobile_whatsapp':
                norm['whatsappNumber'] = norm_phone
                
    # Check provenance
    source = entry.get('source')
    if not source:
        issues.append("Missing provenance field 'source'")
    elif source not in VALID_SOURCES:
        issues.append(f"Invalid source '{source}'. Must be one of {VALID_SOURCES}")
        
    if source == 'google_maps':
        if not entry.get('sourceUrl') and not entry.get('sourcePlaceId'):
            issues.append("Google Maps source requires 'sourceUrl' or 'sourcePlaceId'")
            
    # Verified date
    vdate = entry.get('verifiedDate')
    if vdate:
        try:
            datetime.fromisoformat(vdate.replace('Z', '+00:00'))
        except ValueError:
            issues.append(f"Invalid verifiedDate '{vdate}'. Must be ISO format (YYYY-MM-DD)")
    else:
        norm['verifiedDate'] = datetime.now().strftime('%Y-%m-%d')
            
    return len(issues) == 0, issues, norm

if __name__ == '__main__':
    test_entries = [
        {"name": "Nayara Bocas del Toro", "phone": "+507 838-8362", "source": "google_maps", "sourcePlaceId": "ChIJNayara"},
        {"name": "Hospital Isla Colón", "phone": "757-9205", "source": "official_registry"},
        {"name": "Policía Nacional", "phone": "104", "source": "official_registry"}
    ]
    for t in test_entries:
        valid, errs, norm = validate_provider_entry(t)
        print(f"[{'PASS' if valid else 'FAIL'}] {t['name']} -> {norm.get('phone')}")

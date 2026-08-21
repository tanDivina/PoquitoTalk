<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pendingFile = __DIR__ . '/../data/pending_updates.json';
$captainsFile = __DIR__ . '/../data/captains.json';
$contractorsFile = __DIR__ . '/../data/contractors.json';

// 1. GET: Return list of pending listing claims/updates (for admin)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $pending = file_exists($pendingFile) ? json_decode(file_get_contents($pendingFile), true) : [];
    echo json_encode(['success' => true, 'count' => count($pending), 'data' => $pending]);
    exit;
}

// 2. POST: Submit a listing claim or approve/reject by admin
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $action = isset($input['action']) ? $input['action'] : 'submit_claim';

    // Admin Approval / Rejection Action
    if ($action === 'approve' || $action === 'reject') {
        $claimId = isset($input['claim_id']) ? $input['claim_id'] : '';
        if (!$claimId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing claim_id']);
            exit;
        }

        $pending = file_exists($pendingFile) ? json_decode(file_get_contents($pendingFile), true) : [];
        $matchedIdx = -1;
        $claimItem = null;

        foreach ($pending as $idx => $p) {
            if ($p['id'] === $claimId) {
                $matchedIdx = $idx;
                $claimItem = $p;
                break;
            }
        }

        if ($matchedIdx === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Claim not found']);
            exit;
        }

        if ($action === 'approve') {
            $providerId = $claimItem['provider_id'];
            $newDetails = $claimItem['requested_changes'];

            // Update in captains.json if it exists there
            if (file_exists($captainsFile)) {
                $captains = json_decode(file_get_contents($captainsFile), true) ?: [];
                $updatedCaptain = false;
                foreach ($captains as &$c) {
                    if ($c['id'] === $providerId) {
                        if (!empty($newDetails['name'])) $c['name'] = $newDetails['name'];
                        if (!empty($newDetails['phone'])) {
                            $c['phone'] = $newDetails['phone'];
                            $raw = preg_replace('/[^0-9]/', '', $newDetails['phone']);
                            $c['phone_raw'] = '+' . $raw;
                            $c['whatsapp_url'] = 'https://wa.me/' . $raw;
                        }
                        if (!empty($newDetails['hours'])) $c['hours'] = $newDetails['hours'];
                        if (!empty($newDetails['description'])) {
                            $c['description'] = $newDetails['description'];
                            $c['description_en'] = $newDetails['description'];
                        }
                        $updatedCaptain = true;
                        break;
                    }
                }
                if ($updatedCaptain) {
                    file_put_contents($captainsFile, json_encode($captains, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                }
            }

            $pending[$matchedIdx]['status'] = 'approved';
            $pending[$matchedIdx]['resolved_at'] = date('c');
        } else {
            $pending[$matchedIdx]['status'] = 'rejected';
            $pending[$matchedIdx]['resolved_at'] = date('c');
        }

        file_put_contents($pendingFile, json_encode($pending, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'action' => $action, 'message' => "Claim $action successfully"]);
        exit;
    }

    // Standard User Claim / Update Submission
    $providerId = isset($input['provider_id']) ? trim($input['provider_id']) : '';
    $providerName = isset($input['provider_name']) ? trim($input['provider_name']) : '';
    $verificationMethod = isset($input['verification_method']) ? trim($input['verification_method']) : 'whatsapp';
    $claimantName = isset($input['claimant_name']) ? trim($input['claimant_name']) : '';
    $currentPhone = isset($input['current_phone']) ? trim($input['current_phone']) : '';
    $newPhone = isset($input['new_phone']) ? trim($input['new_phone']) : '';
    $requestedChanges = isset($input['requested_changes']) ? $input['requested_changes'] : [];
    $idPhotoBase64 = isset($input['id_photo_base64']) ? $input['id_photo_base64'] : '';

    if (!$providerId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing provider_id']);
        exit;
    }

    $claimId = 'claim_' . uniqid();
    $newEntry = [
        'id' => $claimId,
        'provider_id' => $providerId,
        'provider_name' => $providerName,
        'verification_method' => $verificationMethod,
        'claimant_name' => $claimantName,
        'current_phone' => $currentPhone,
        'new_phone' => $newPhone,
        'requested_changes' => $requestedChanges,
        'has_id_document' => !empty($idPhotoBase64),
        'submitted_at' => date('c'),
        'status' => ($verificationMethod === 'whatsapp' ? 'verified_whatsapp' : 'pending_admin_review')
    ];

    // Save ID document photo if present
    if (!empty($idPhotoBase64)) {
        $uploadsDir = __DIR__ . '/../data/claims/';
        if (!file_exists($uploadsDir)) {
            @mkdir($uploadsDir, 0755, true);
        }
        $imgData = preg_replace('#^data:image/\w+;base64,#i', '', $idPhotoBase64);
        $decoded = base64_decode($imgData);
        if ($decoded) {
            $imgPath = $uploadsDir . $claimId . '.jpg';
            file_put_contents($imgPath, $decoded);
            $newEntry['id_photo_url'] = 'data/claims/' . $claimId . '.jpg';
        }
    }

    $pending = file_exists($pendingFile) ? json_decode(file_get_contents($pendingFile), true) : [];
    $pending[] = $newEntry;
    file_put_contents($pendingFile, json_encode($pending, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Send email alert to admin via FormSubmit.co
    $emailPayload = [
        '_subject' => "[PoquitoTalk Claim] New Listing Update: {$providerName}",
        'ProviderID' => $providerId,
        'ProviderName' => $providerName,
        'VerificationMethod' => $verificationMethod,
        'ClaimantName' => $claimantName,
        'Phone' => $newPhone ?: $currentPhone,
        'RequestedChanges' => json_encode($requestedChanges, JSON_UNESCAPED_UNICODE),
        'SubmittedAt' => date('r')
    ];

    @file_get_contents('https://formsubmit.co/ajax/support@hero-apps.com', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'content' => json_encode($emailPayload),
            'timeout' => 3
        ]
    ]));

    echo json_encode([
        'success' => true,
        'claim_id' => $claimId,
        'status' => $newEntry['status'],
        'message' => ($verificationMethod === 'whatsapp' 
            ? 'WhatsApp verification initiated. Please send the confirmation message.' 
            : 'Your update request and ID have been submitted for priority review. We will notify you once verified.')
    ]);
    exit;
}

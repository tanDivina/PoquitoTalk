// PoquitoTalk Community Vouch Engine (Mobile & Server Sync)
import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_FILE = `${FileSystem.documentDirectory || ''}poquito_local_vouches.json`;
const API_BASE = 'https://poquitotalk.hero-apps.com/api/vouch.php';

export interface VouchSummary {
  count: number;
  reasons: {
    fast_response: number;
    fair_price: number;
    great_service: number;
  };
}

class VouchService {
  private localVouchedSet: Set<string> = new Set();
  private isLoaded = false;

  private async loadLocalVouches() {
    if (this.isLoaded) return;
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('poquito_local_vouches');
        if (raw) {
          const list: string[] = JSON.parse(raw);
          this.localVouchedSet = new Set(list);
        }
      } else if (FileSystem.documentDirectory) {
        const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE);
        if (fileInfo.exists) {
          const content = await FileSystem.readAsStringAsync(STORAGE_FILE);
          const list: string[] = JSON.parse(content);
          this.localVouchedSet = new Set(list);
        }
      }
      this.isLoaded = true;
    } catch (e) {
      console.warn('Could not load local vouches:', e);
    }
  }

  public async hasVouched(providerId: string): Promise<boolean> {
    await this.loadLocalVouches();
    return this.localVouchedSet.has(providerId);
  }

  public async submitVouch(providerId: string, reason: 'fast_response' | 'fair_price' | 'great_service' = 'great_service'): Promise<boolean> {
    await this.loadLocalVouches();
    this.localVouchedSet.add(providerId);

    try {
      const data = JSON.stringify(Array.from(this.localVouchedSet));
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('poquito_local_vouches', data);
      } else if (FileSystem.documentDirectory) {
        await FileSystem.writeAsStringAsync(STORAGE_FILE, data);
      }
    } catch (e) {
      console.warn('Local save vouch error:', e);
    }

    // Sync with remote server API
    try {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, reason }),
      });
      return true;
    } catch (e) {
      console.warn('Remote vouch sync error (saved offline):', e);
      return true;
    }
  }

  public async fetchVouchCounts(): Promise<Record<string, VouchSummary>> {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) return {};
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('Could not fetch remote vouch counts:', e);
    }
    return {};
  }
}

export const vouchService = new VouchService();

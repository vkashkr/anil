const TABLE_NAME = "gif-gif";

export interface Profile {
  id: string; // Partition Key
  name: string;
  age: string;
  gender: string;
  location: string;
  description: string;
  services: string[];
  images: string[];
  customCss?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  isVisible: boolean;
  updatedAt: string;
  extraProperties?: Record<string, string>;
}

const API_URL = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/admin';

async function callApi(body: any) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Gateway Error: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function saveProfileToDynamoDB(profile: Profile, action: string = 'save') {
    return callApi({ action, profile });
}

export async function getProfileFromDynamoDB(id: string) {
    const result = await callApi({ action: 'get_profile', id });
    return result.profile as Profile | undefined;
}

export async function getAllProfilesFromDynamoDB() {
    const result = await callApi({ action: 'scan_profiles' });
    return result.profiles as Profile[];
}

export async function deleteProfileFromDynamoDB(id: string) {
    return callApi({ action: 'delete_profile', id });
}

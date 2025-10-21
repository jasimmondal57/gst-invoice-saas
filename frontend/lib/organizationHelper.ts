/**
 * Helper function to get organization ID from localStorage or fetch it from the backend
 * This handles both new users (who have organizationId in localStorage) and
 * existing users (who logged in before organizationId was added to localStorage)
 */
export async function getOrganizationId(token: string): Promise<string | null> {
  // First, try to get from localStorage
  const cachedOrgId = localStorage.getItem('organizationId');
  console.log('getOrganizationId - Cached orgId:', cachedOrgId);

  if (cachedOrgId) {
    console.log('getOrganizationId - Returning cached orgId:', cachedOrgId);
    return cachedOrgId;
  }

  // If not in localStorage, fetch from backend
  try {
    console.log('getOrganizationId - Fetching organizations from backend');
    const response = await fetch('http://localhost:5000/api/v1/organizations', {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('getOrganizationId - Response status:', response.status);

    if (response.ok) {
      const organizations = await response.json();
      console.log('getOrganizationId - Organizations:', organizations);

      if (organizations.length > 0) {
        const firstOrgId = organizations[0].id;
        console.log('getOrganizationId - Found orgId:', firstOrgId);
        // Cache it for future use
        localStorage.setItem('organizationId', firstOrgId);
        return firstOrgId;
      } else {
        console.warn('getOrganizationId - No organizations found for user');
      }
    } else {
      const errorText = await response.text();
      console.error('getOrganizationId - Error response:', response.status, errorText);
    }
  } catch (error) {
    console.error('Failed to fetch organization ID:', error);
  }

  console.warn('getOrganizationId - Returning null');
  return null;
}


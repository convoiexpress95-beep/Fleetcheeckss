export class EdgeFunctionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';
  }

  async callEdgeFunction(functionName: string, data?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/edge/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Edge function ${functionName} failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling edge function ${functionName}:`, error);
      throw error;
    }
  }
}

export const edgeService = new EdgeFunctionService();

import { useState, useCallback } from 'react';
import { edgeService } from '@/services/edge-functions';
import { useToast } from './use-toast';

export function useEdgeFunctions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const callFunction = useCallback(async (functionName: string, data?: any) => {
    setLoading(true);
    try {
      const result = await edgeService.callEdgeFunction(functionName, data);
      toast({
        title: 'Success',
        description: `Edge function ${functionName} executed successfully`,
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to execute ${functionName}: ${error.message}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    callFunction,
    loading,
  };
}

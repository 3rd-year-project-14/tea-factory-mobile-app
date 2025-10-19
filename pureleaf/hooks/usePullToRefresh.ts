import { useState } from "react";

export function usePullToRefresh(refreshFunction: () => Promise<void> | void) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshFunction();
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, onRefresh };
}

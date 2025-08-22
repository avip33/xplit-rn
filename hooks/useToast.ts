import { showToast } from '../components/ui/Toast';

export const useToast = () => {
  return {
    success: showToast.success,
    error: showToast.error,
    info: showToast.info,
    warning: showToast.warning,
  };
};

import useLoadingStore from "@/store/useLoadingStore";
import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const excludedRoutes = [
  "/map",
  "/app/reservationManagement",
  "/app/edit-accommodation",
  "/app/edit-unit",
];

function finishLoading(config) {
  if (!config?.metadata?.globalLoading) return;
  config.metadata.globalLoading = false;
  useLoadingStore.getState().stopLoading();
}

axiosInstance.interceptors.request.use((config) => {
  const currentPath = window.location.pathname;
  const shouldSkipLoading = config.skipGlobalLoading || excludedRoutes.some(
    (route) => currentPath === route || currentPath.startsWith(`${route}/`),
  );

  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Keep the decision on the request, even if the user changes pages.
  config.metadata = { ...config.metadata, globalLoading: !shouldSkipLoading };
  if (!shouldSkipLoading) useLoadingStore.getState().startLoading();
  return config;
});

function getErrorMessages(data) {
  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    return Object.values(errors).flat().filter((message) => typeof message === "string");
  }
  if (typeof data === "string") return [data];
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return [data.detail];
    if (typeof data.message === "string") return [data.message];
    if (typeof data.title === "string") return [data.title];
    return Object.values(data).flat().filter((message) => typeof message === "string");
  }
  return [];
}

axiosInstance.interceptors.response.use(
  (response) => {
    finishLoading(response.config);
    return response;
  },
  (error) => {
    finishLoading(error.config);
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const data = error.response?.data;
    if (status === 400) {
      const messages = getErrorMessages(data);
      (messages.length ? messages : ["اطلاعات ارسال‌شده معتبر نیست"]).forEach((message) => {
        toast.error(message);
      });
    } else if (status === 401 || status === 403) {
      toast.error("اعتبار شما به پایان رسیده است، لطفاً مجدداً وارد شوید");
      setTimeout(() => { window.location.href = "/"; }, 3000);
    } else if (status >= 500) {
      toast.error("خطای سرور، لطفاً مجدداً تلاش کنید");
    } else if (error.response) {
      toast.error(getErrorMessages(data)[0] || "خطای ناشناخته");
    } else {
      toast.error("خطای اتصال، لطفاً مجدداً بررسی نمایید");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

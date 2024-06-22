import ApiOrderService from "./client/ApiOrderService";

export const fetchQuantityNotifi = () => {
  return ApiOrderService.get("/notification/num-notification");
};
export const fetchDataNotifi = () => {
  return ApiOrderService.get("/notification/get-notifications");
};

export interface PlanDto {
  planCode: string;
  billingCycle: "monthly" | "annual" | "trial";
}

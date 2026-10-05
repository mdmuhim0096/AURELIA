export const payoneerProvider = {
  id: "payoneer",
  // Checkout availability depends on an approved Payoneer merchant product/API.
  // Keep capability false until a merchant-specific adapter is implemented and verified.
  configured: () => false,
  async create() {
    throw Object.assign(new Error("Payoneer checkout is capability-gated. Add an adapter only for an officially approved merchant checkout flow."), { status: 503 });
  }
};

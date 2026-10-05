// Register all models that are used as Mongoose populate() targets.
// Import this once from the database layer so route execution order never
// determines whether a referenced schema is available.
import "@/models/Brand";
import "@/models/Category";
import "@/models/ChatConversation";
import "@/models/Order";
import "@/models/Payment";
import "@/models/Permission";
import "@/models/Product";
import "@/models/ProductVariant";
import "@/models/Role";
import "@/models/SupportTicket";
import "@/models/User";
import "@/models/Wallet";

import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Brand from "@/models/Brand";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function GET() { try { const session = await auth(); requirePermission(session, PERMISSIONS.PRODUCTS_READ); await connectDB(); return ok({ items: await Brand.find({}).sort({ name: 1 }).lean() }); } catch (error) { return fromError(error, "Unable to load brands"); } }
export async function POST(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.BRANDS_WRITE); const body = await readJson(request); if (!body.name || !body.slug) return fail("Name and slug are required", 400); await connectDB(); const brand = await Brand.create(body); await audit({ actor: session.user.id, action: "brand.created", resourceType: "Brand", resourceId: brand._id, newValue: body }); return ok({ brand }, { status: 201 }); } catch (error) { return fromError(error, "Unable to create brand"); } };

export async function PATCH(request) {
    try {
        const session = await auth(); requirePermission(session, PERMISSIONS.BRANDS_WRITE);
        const body = await readJson(request);

        await connectDB();
        const previous = await Brand.findById(body.id).lean();

        if (!previous) return fail("Brand not found", 404);
        const allowed = ["name", "slug", "logo", "description", "featured", "seo"];

        const updates = Object.fromEntries(allowed.filter((key) => Object.prototype.hasOwnProperty.call(body, key)).map((key) => [key, body[key]]));

        const brand = await Brand.findByIdAndUpdate(previous._id, { $set: updates }, { new: true, runValidators: true });

        await audit({ actor: session.user.id, action: "brand.updated", resourceType: "Brand", resourceId: previous._id, previousValue: previous, newValue: updates }); return ok({ brand });

    } catch (error) { return fromError(error, "Unable to update brand"); }
};

export async function DELETE(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.BRANDS_WRITE); const id = new URL(request.url).searchParams.get("id"); await connectDB(); const previous = await Brand.findByIdAndDelete(id).lean(); await audit({ actor: session.user.id, action: "brand.deleted", resourceType: "Brand", resourceId: id, previousValue: previous }); return ok({ deleted: true }); } catch (error) { return fromError(error, "Unable to delete brand"); } }

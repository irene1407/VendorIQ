import { Router, type IRouter } from "express";
import { GetCurrentUserResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/auth/me", (_req, res) => {
  const data = GetCurrentUserResponse.parse({
    id: "user-1",
    name: "Sarah Jenkins",
    role: "Chief Procurement Officer",
    company: "VendorIQ Global Industries",
    online: true,
    avatarInitials: "SJ",
  });
  res.json(data);
});

export default router;

import { type DomainIconId, type HttpMethod } from "@/lib/praxis";

export type CallScene = {
  id: string;
  domain: DomainIconId;
  label: string;
  method: HttpMethod;
  path: string;
  latencyMs: number;
  /** Short envelope preview lines shown after resolve. */
  preview: readonly { key: string; value: string; kind: "str" | "num" | "bool" }[];
};

/** Curated call stories — production-shaped Praxis surfaces only. */
export const callScenes: readonly CallScene[] = [
  {
    id: "ecommerce",
    domain: "ecommerce",
    label: "Ecommerce",
    method: "GET",
    path: "/api/v1/ecommerce/products",
    latencyMs: 96,
    preview: [
      { key: "statusCode", value: "200", kind: "num" },
      { key: "success", value: "true", kind: "bool" },
      { key: "data.products", value: "12 items", kind: "str" },
      { key: "message", value: "Products fetched successfully", kind: "str" },
    ],
  },
  {
    id: "auth",
    domain: "auth",
    label: "Auth",
    method: "POST",
    path: "/api/v1/users/login",
    latencyMs: 112,
    preview: [
      { key: "statusCode", value: "200", kind: "num" },
      { key: "success", value: "true", kind: "bool" },
      { key: "data.accessToken", value: "eyJhbGci…", kind: "str" },
      { key: "message", value: "User logged in successfully", kind: "str" },
    ],
  },
  {
    id: "social",
    domain: "social",
    label: "Social",
    method: "GET",
    path: "/api/v1/social-media/posts",
    latencyMs: 88,
    preview: [
      { key: "statusCode", value: "200", kind: "num" },
      { key: "success", value: "true", kind: "bool" },
      { key: "data.posts", value: "8 items", kind: "str" },
      { key: "message", value: "Posts fetched successfully", kind: "str" },
    ],
  },
  {
    id: "chat",
    domain: "chat",
    label: "Chat",
    method: "GET",
    path: "/api/v1/chat-app/chats",
    latencyMs: 74,
    preview: [
      { key: "statusCode", value: "200", kind: "num" },
      { key: "success", value: "true", kind: "bool" },
      { key: "data.chats", value: "3 rooms", kind: "str" },
      { key: "message", value: "Chats fetched successfully", kind: "str" },
    ],
  },
] as const;

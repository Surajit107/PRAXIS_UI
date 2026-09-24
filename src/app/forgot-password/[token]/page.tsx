import { redirect } from "next/navigation";

type LegacyForgotPasswordTokenPageProps = {
  params: Promise<{ token: string }>;
};

/** Legacy path emails → single query-param page. */
export default async function LegacyForgotPasswordTokenPage({
  params,
}: LegacyForgotPasswordTokenPageProps) {
  const { token } = await params;
  redirect(`/forgot-password?token=${encodeURIComponent(token)}`);
}

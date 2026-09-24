import { redirect } from "next/navigation";

type LegacyVerifyEmailTokenPageProps = {
  params: Promise<{ token: string }>;
};

/** Legacy path emails → single query-param page. */
export default async function LegacyVerifyEmailTokenPage({
  params,
}: LegacyVerifyEmailTokenPageProps) {
  const { token } = await params;
  redirect(`/verify-email?token=${encodeURIComponent(token)}`);
}

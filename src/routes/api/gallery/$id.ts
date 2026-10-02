import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/gallery/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.id);
        if (!Number.isInteger(id) || id <= 0) return new Response("Não encontrada", { status: 404 });
        const { getSql } = await import("@/lib/db");
        const sql = await getSql();
        const rows = await sql<{ data: string | null }>`select data from gallery_photos where id = ${id}`;
        const data = rows[0]?.data;
        if (!data?.startsWith("data:image/jpeg;base64,")) {
          return new Response("Não encontrada", { status: 404 });
        }
        const bytes = Buffer.from(data.slice("data:image/jpeg;base64,".length), "base64");
        return new Response(bytes, {
          headers: {
            "content-type": "image/jpeg",
            "cache-control": "private, max-age=86400",
          },
        });
      },
    },
  },
});

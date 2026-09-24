import { evaluate } from "@mdx-js/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { createElement, type ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { mdxComponents } from "@/components/docs/MdxComponents";

export async function compileDocsMdx(source: string): Promise<{
  content: ReactNode;
}> {
  const mod = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["docs-heading-anchor"],
          },
        },
      ],
    ],
  });

  const Content = mod.default;
  return {
    content: createElement(Content, { components: mdxComponents }),
  };
}

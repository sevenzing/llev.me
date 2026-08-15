export type StackItem = {
  id: string;
  label: string;
  bg: string;
  fg: string;
  /** simpleicons.org slug; defaults to `id` */
  icon?: string;
};

export const STACK_ITEMS: StackItem[] = [
  { id: "react", label: "React", bg: "rgba(97, 218, 251, 0.16)", fg: "#61DAFB" },
  { id: "rust", label: "Rust", bg: "rgba(222, 165, 132, 0.16)", fg: "#DEA584" },
  { id: "python", label: "Python", bg: "rgba(55, 118, 171, 0.2)", fg: "#FFD43B", icon: "python" },
];

export function stackIconUrl(item: StackItem): string {
  const slug = item.icon ?? item.id;
  const hex = item.fg.replace("#", "");
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}

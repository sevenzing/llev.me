export const STACK_LOOP_TEXT = "1; DROP TABLE users --";

export type StackItem = {
  id: string;
  label: string;
  bg: string;
  fg: string;
  /** simpleicons.org slug; defaults to `id` */
  icon?: string;
  /** full icon URL; skips Simple Icons when set */
  src?: string;
};

export const STACK_ITEMS: StackItem[] = [
  { id: "react", label: "React", bg: "rgba(97, 218, 251, 0.16)", fg: "#61DAFB" },
  { id: "rust", label: "Rust", bg: "rgba(222, 165, 132, 0.16)", fg: "#DEA584" },
  { id: "python", label: "Python", bg: "rgba(55, 118, 171, 0.2)", fg: "#FFD43B" },
  { id: "solidity", label: "Solidity", bg: "rgba(232, 232, 232, 0.14)", fg: "#E8E8E8" },
  { id: "ens", label: "ENS", bg: "rgba(82, 152, 255, 0.16)", fg: "#5298FF" },
  { id: "postgres", label: "Postgres", bg: "rgba(65, 105, 225, 0.16)", fg: "#4169E1", icon: "postgresql" },
  { id: "docker", label: "Docker", bg: "rgba(36, 150, 237, 0.16)", fg: "#2496ED" },
  {
    id: "grpc",
    label: "gRPC",
    bg: "rgba(0, 181, 173, 0.16)",
    fg: "#00B5AD",
    src: "https://api.iconify.design/logos/grpc.svg",
  },
  { id: "rabbitmq", label: "RabbitMQ", bg: "rgba(255, 102, 0, 0.16)", fg: "#FF6600" },
  { id: "k8s", label: "k8s", bg: "rgba(50, 108, 229, 0.16)", fg: "#326CE5", icon: "kubernetes" },
  { id: "nginx", label: "Nginx", bg: "rgba(0, 150, 57, 0.16)", fg: "#009639" },
  {
    id: "viem",
    label: "viem",
    bg: "rgba(255, 92, 40, 0.16)",
    fg: "#FF5C28",
    src: "/stack/viem.svg",
  },
];

export function stackIconUrl(item: StackItem): string {
  if (item.src) return item.src;
  const slug = item.icon ?? item.id;
  const hex = item.fg.replace("#", "");
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}

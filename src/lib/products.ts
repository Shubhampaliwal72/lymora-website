// Add real products here when they exist; no placeholder products or release claims.
export const messenger = {
  name: "LAN Messenger",
  brandName: "Lymora LAN Messenger",
  path: "/products/lan-messenger/",
  docs: "/products/lan-messenger/docs/",
  releases: "/downloads/#release-notes",
  platform: "Windows",
  summary: "Messages, groups and files. Directly between nearby Windows PCs.",
} as const;
export const products = [messenger] as const;
export const productViews = [
  {id: "chats", label: "Conversations", title: "A conversation, without the distance.", description: "Choose a nearby device and start talking. Delivery and read indicators help you follow the conversation.", detail: "Direct messages / Local history / Replies", alt: "Actual Lymora direct chat with fictional launch-review messages and delivery indicators"},
  {id: "groups", label: "Groups", title: "Your people. In the same conversation.", description: "Create a group, invite nearby teammates and keep the discussion together. See release notes for the controls included in your build.", detail: "Shared groups / Invitations / Member lists", alt: "Actual Lymora Studio team group with three fictional members and per-member delivery acknowledgements"},
  {id: "files", label: "File sharing", title: "The file you need. Right here.", description: "Review an attachment before sending. Share files or folders and preview supported images inside the conversation.", detail: "Attachment review / Folders as ZIP / Image previews", alt: "Actual Lymora attachment cards showing a fictional launch note and the original Lymora logo preview"},
  {id: "network", label: "Discovery", title: "Find the people already nearby.", description: "See reachable devices running Lymora on your local network. A clear connection view keeps troubleshooting close when you need it.", detail: "Nearby devices / Connection status / Network details", alt: "Actual Lymora Network screen with fictional contacts and reserved documentation IP addresses"},
] as const;

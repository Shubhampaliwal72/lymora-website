# Draft: How local-network messaging works

Status: owner-review draft, not a published page. Prefer expanding the existing network guide if it answers the same question.

A LAN messenger connects computers that can reach each other on a local network. In Lymora's current Windows release, those computers can exchange direct messages, group conversations and files without a cloud account. The installed applications do not need internet access for the LAN conversation, but they still need a working network connection to each other.

## Nearby is a network condition

Two people can sit beside each other while their PCs are isolated by guest Wi-Fi. Conversely, devices connected by Ethernet and Wi-Fi may communicate if the network permits it. A shared room, internet provider or Wi-Fi name is not proof of reachability.

Install compatible Lymora builds on both PCs and enable LAN access on a trusted network. Discovery helps locate nearby devices. Discovery and message delivery are separate: seeing a name does not prove that the direct connection is permitted or that the name belongs to the person you expect.

## Discovery, then a conversation

Once the devices are reachable, choose the intended contact and send a message. Group invitations and file sharing have their own visible controls. Follow the guide for the exact steps supported by your version. A delivered message, a read receipt and a group delivery count communicate different things; one does not establish the others.

For files, select or drop a file, review the pending selection and confirm sending. Keep the applications running until the transfer completes. Network speed, disk space and application availability still matter. Do not describe practical file sizes as unlimited.

## Internet independence has boundaries

Downloading an installer or checking a public release may require internet access. LAN messaging itself is a different activity. It is not a promise of global messaging without connectivity, remote cloud synchronization, or delivery to a PC that cannot be reached.

Local operation also does not automatically establish privacy or identity verification. Read the version-specific privacy explanation for discovery visibility, transport protection and local file storage. Do not infer security guarantees from the word offline.

Suggested links: /products/lan-messenger/, /products/lan-messenger/docs/#network, /downloads/, /privacy/.

Visual brief: two Windows PCs on a reachable local network; use the original product artwork and an explanatory HTML/SVG diagram. Do not show a required cloud relay or invented calling features. Evidence owner: desktop maintainer; review against the approved release before publication.

# Draft: When nearby PCs do not connect

Status: review draft. The existing /products/lan-messenger/docs/#troubleshooting guide remains the public source; do not add a duplicate article without a distinct purpose.

Start with both PCs. Open compatible Lymora builds, enable LAN messaging deliberately, and check whether the devices can reach each other on the intended network. Keep the applications running while testing. Record the installed version and exact error rather than assuming every connection failure has the same cause.

## Separate discovery from delivery

If no device appears, refresh discovery after both apps are open. If a contact appears but a message does not arrive, discovery has supplied information; it has not established that a direct message connection works. Guest isolation, VPN routing, separate subnets and Windows firewall permissions can affect those two operations differently.

Use the Network view and the other PC's displayed address when following the guide's Add IP option. An address is a way to find a route, not proof of who controls the device. Do not publish guessed ports or ask readers to disable their firewall globally. Ask the network administrator about isolation or application permissions where appropriate.

## Treat key changes carefully

If the app reports that a remembered device key changed, check with the other person. Reinstalling and removing data can change identity information, but an unexplained change should not be dismissed. Follow the recovery flow for the installed release; do not bypass checks just to make an error disappear. Newer development trust workflows must not be presented as features of the published build.

## Check the actual failing operation

For a file transfer, keep both applications running, check available disk space, and use the error the app actually reports. A Windows notification problem is different from message delivery: notification preferences and Windows Do not disturb settings may suppress a banner.

If the guide does not resolve the problem, collect the version, Windows version, network arrangement and non-sensitive error text. Do not post private messages, identity secrets, or personal file paths. Direct public support channels must be verified before a new link is published; the website currently offers the working troubleshooting guide.

Suggested links: /products/lan-messenger/docs/#setup, #network and #troubleshooting, /downloads/#release-notes, /privacy/.

Before publication: reproduce every instruction using disposable data and two supported PCs; approve screenshots with fictional names and reserved documentation addresses. Desktop maintainer owns factual review.

export class PermCatalog {
    static list() {
        return [
            this.p("auth", "session", "read", "auth.session.read"),
            this.p("auth", "session", "revoke", "auth.session.revoke"),
            // Users & Profiles
            this.p("users", "farmer", "read", "users.farmer.read"),
            this.p("users", "farmer", "update", "users.farmer.update"),
            this.p("users", "creator", "read", "users.creator.read"),
            this.p("users", "creator", "update", "users.creator.update"),
            this.p("users", "trader", "read", "users.trader.read"),
            this.p("users", "trader", "update", "users.trader.update"),
            this.p("users", "company", "read", "users.company.read"),
            this.p("users", "company", "update", "users.company.update"),
            this.p("users", "admin", "manage", "users.admin.manage"),
            // Mandi & Products
            this.p("mandi", "mandi", "read", "mandi.mandi.read"),
            this.p("mandi", "mandi", "manage", "mandi.mandi.manage"),
            this.p("mandi", "product", "manage", "mandi.product.manage"),
            this.p("mandi", "price", "manage", "mandi.price.manage"),
            // Content & Insights
            this.p("content", "video", "upload", "content.video.upload"),
            this.p("content", "video", "moderate", "content.video.moderate"),
            this.p("content", "market_insight", "manage", "content.market_insight.manage"),
            this.p("content", "scheme", "manage", "content.scheme.manage"),
            this.p("content", "poll", "manage", "content.poll.manage"),
            // Gamification
            this.p("gamification", "points", "manage", "gamification.points.manage"),
            this.p("gamification", "badges", "manage", "gamification.badges.manage"),
            // Campaigns & Leads
            this.p("campaign", "campaign", "create", "campaign.campaign.create"),
            this.p("campaign", "campaign", "approve", "campaign.campaign.approve"),
            this.p("campaign", "wallet", "manage", "campaign.wallet.manage"),
            this.p("campaign", "lead", "manage", "campaign.lead.manage"),
            // Settings
            this.p("settings", "settings", "read", "settings.read"),
            this.p("settings", "settings", "update", "settings.update"),
            // Notifications
            this.p("notify", "notification", "send", "notify.notification.send"),
            // Audit & Platform
            this.p("audit", "log", "read", "audit.log.read"),
            this.p("platform", "logs", "read", "platform.logs.read"),
            // Roles & Permissions
            this.p("roles", "role", "create", "roles.create"),
            this.p("roles", "role", "read", "roles.read"),
            this.p("roles", "role", "update", "roles.update"),
            this.p("roles", "role", "delete", "roles.delete"),
            this.p("roles", "permission", "assign", "roles.permission.assign"),
        ];
    }
    static p(module, resource, action, key) {
        return {
            module,
            resource,
            action,
            key,
            description: key,
        };
    }
}

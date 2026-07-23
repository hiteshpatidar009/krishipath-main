import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleGuard from "../layouts/RoleGuard";
import { PERMISSIONS } from "../core/permissions/constants";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Lazy loaded layouts
const EnterpriseLayout  = React.lazy(() => import("../layouts/EnterpriseLayout"));

// Master Data pages
const CropCatalog       = React.lazy(() => import("../domains/master/pages/CropCatalog"));
const MasterDataManager = React.lazy(() => import("../domains/master/pages/MasterDataManager"));
const ProductManager    = React.lazy(() => import("../domains/master/pages/ProductManager"));
const CreateProduct     = React.lazy(() => import("../domains/master/pages/CreateProduct"));
const States            = React.lazy(() => import("../pages/superadmin/States"));
const Districts         = React.lazy(() => import("../pages/superadmin/Districts"));

// User / Admin pages
const AdminPermissions   = React.lazy(() => import("../domains/user/pages/AdminPermissions"));
const FarmerDirectory    = React.lazy(() => import("../domains/user/pages/FarmerDirectory"));
const CreateAdmin        = React.lazy(() => import("../domains/user/pages/CreateAdmin"));
const PendingApprovals   = React.lazy(() => import("../domains/user/pages/PendingApprovals"));

// Content pages
const SchemesManager     = React.lazy(() => import("../domains/content/pages/SchemesManager"));
const PredictionsManager = React.lazy(() => import("../domains/content/pages/PredictionsManager"));
const PollsManager       = React.lazy(() => import("../domains/content/pages/PollsManager"));
const CreatorsManager    = React.lazy(() => import("../domains/content/pages/CreatorsManager"));
const ShortsManager      = React.lazy(() => import("../domains/content/pages/ShortsManager"));

// Mandi pages
const MandiDirectory    = React.lazy(() => import("../domains/mandi/pages/MandiDirectory"));
const TraderPriceManager = React.lazy(() => import("../domains/mandi/pages/TraderPriceManager"));
const TraderRegistry     = React.lazy(() => import("../domains/mandi/pages/TraderRegistry"));
const MarketInsightsManager = React.lazy(() => import("../domains/mandi/pages/MarketInsightsManager"));

// Localization
const TranslationCenter = React.lazy(() => import("../domains/localization/pages/TranslationCenter"));
const Sandbox           = React.lazy(() => import("../layouts/Sandbox"));

// Market Source
const MarketSourceList    = React.lazy(() => import("../domains/market-source/pages/MarketSourceList"));
const CreateMarketSource  = React.lazy(() => import("../domains/market-source/pages/CreateMarketSource"));
const EditMarketSource    = React.lazy(() => import("../domains/market-source/pages/EditMarketSource"));
const MarketSourceProfile = React.lazy(() => import("../domains/market-source/pages/MarketSourceProfile"));

// Placeholders
const DashboardPlaceholder   = () => <div className="p-8">Dashboard Content</div>;
const UnauthorizedPlaceholder = () => <div className="p-8 text-red-600">Unauthorized Access</div>;

export default function AppRouter() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">Booting KrishiPath OS...</div>}>
      <Routes>
        <Route path="/"            element={<Navigate to="/login" replace />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPlaceholder />} />

        {/* Enterprise Application Shell */}
        <Route path="/app" element={<EnterpriseLayout />}>
          
          <Route index element={<DashboardPlaceholder />} />

          {/* ── MASTER DATA ── */}
          <Route path="master">
            <Route path="categories"   element={<MasterDataManager type="crop_category" />} />
            <Route path="crop-catalog" element={<CropCatalog />} />
            <Route path="grades"       element={<MasterDataManager type="grade" />} />
            <Route path="units"        element={<MasterDataManager type="unit" />} />
            <Route path="languages"    element={<MasterDataManager type="language" />} />
            <Route path="states"       element={<States />} />
            <Route path="districts"    element={<Districts />} />
            <Route path="products"        element={<ProductManager />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route
              path="localization"
              element={
                <RoleGuard requiredPermissions={[PERMISSIONS.LOC_VIEW]}>
                  <TranslationCenter />
                </RoleGuard>
              }
            />
          </Route>

          {/* ── MANDI ── */}
          <Route path="mandi">
            <Route
              path="directory"
              element={
                <RoleGuard requiredPermissions={[PERMISSIONS.MANDI_VIEW]}>
                  <MandiDirectory />
                </RoleGuard>
              }
            />
            <Route
              path="prices"
              element={
                <RoleGuard requiredPermissions={[PERMISSIONS.PRICE_VIEW]}>
                  <TraderPriceManager />
                </RoleGuard>
              }
            />
            <Route
              path="traders"
              element={
                <RoleGuard requiredPermissions={[PERMISSIONS.MANDI_VIEW]}>
                  <TraderRegistry />
                </RoleGuard>
              }
            />
            <Route
              path="insights"
              element={
                <RoleGuard requiredPermissions={[PERMISSIONS.MANDI_VIEW]}>
                  <MarketInsightsManager />
                </RoleGuard>
              }
            />
          </Route>

          {/* ── MARKET SOURCE ── */}
          <Route path="market-sources">
            <Route index element={<MarketSourceList />} />
            <Route path="create" element={<CreateMarketSource />} />
            <Route path="edit/:id" element={<EditMarketSource />} />
            <Route path=":id" element={<MarketSourceProfile />} />
          </Route>

          {/* ── CONTENT MANAGEMENT ── */}
          <Route path="content">
            <Route path="schemes"     element={<SchemesManager />} />
            <Route path="predictions" element={<PredictionsManager />} />
            <Route path="polls"       element={<PollsManager />} />
            <Route path="creators"    element={<CreatorsManager />} />
            <Route path="shorts"      element={<ShortsManager />} />
          </Route>

          {/* ── USER MANAGEMENT ── */}
          <Route path="users">
            <Route path="admins"            element={<AdminPermissions />} />
            <Route path="admins/create"     element={<CreateAdmin />} />
            <Route path="admins/pending"    element={<PendingApprovals />} />
            <Route path="farmers"           element={<FarmerDirectory />} />
          </Route>

          {/* Sandbox */}
          <Route path="sandbox" element={<Sandbox />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

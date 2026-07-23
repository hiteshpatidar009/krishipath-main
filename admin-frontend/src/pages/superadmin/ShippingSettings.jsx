import { useEffect, useState } from "react";
import {
  getShippingSettings,
  updateShippingSettings,
} from "../../services/shippingAPI";

export default function ShippingSettings() {
  const [settings, setSettings] = useState({
    margin: 0,
    discount: 0,
    overrideCharge: "",
    pickupPincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from DB
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getShippingSettings();
      if (res.data) {
        setSettings({
          margin: res.data.margin,
          discount: res.data.discount,
          overrideCharge: res.data.overrideCharge || "",
          pickupPincode: res.data.pickupPincode || "",
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load settings");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings.pickupPincode) {
      alert("Pickup pincode is required");
      return;
    }

    try {
      setSaving(true);
      await updateShippingSettings(settings);
      alert("Settings updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 mt-20">
      <h1 className="text-3xl font-bold mb-6">Shipping Settings</h1>

      <div className="bg-white p-6 rounded shadow max-w-2xl">
        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <>
            {/* Margin */}
            <label className="block font-semibold mt-3">Delivery Margin (₹)</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={settings.margin}
              onChange={(e) =>
                setSettings({ ...settings, margin: Number(e.target.value) })
              }
              placeholder="Example: 10"
            />

            {/* Discount */}
            <label className="block font-semibold mt-3">
              Delivery Discount (₹)
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={settings.discount}
              onChange={(e) =>
                setSettings({ ...settings, discount: Number(e.target.value) })
              }
              placeholder="Example: 5"
            />

            {/* Override charge */}
            <label className="block font-semibold mt-3">
              Override Delivery Charge (Optional)
            </label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={settings.overrideCharge}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  overrideCharge:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="Leave empty to use Shiprocket rate"
            />

            {/* Pickup Pincode */}
            <label className="block font-semibold mt-3">Pickup Pincode</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={settings.pickupPincode}
              onChange={(e) =>
                setSettings({ ...settings, pickupPincode: e.target.value })
              }
              placeholder="Enter your warehouse pincode"
            />

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

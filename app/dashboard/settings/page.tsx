'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getAutonomyLevelLabel, getAutonomyLevelDescription } from '@/lib/shared/utils';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autonomy_level: 1,
    max_concurrent_positions: 5,
    max_daily_orders: 20,
    max_position_size_usd: 10000,
    allow_shorting: false,
    allow_margin: false,
    trading_hours: 'regular',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, save to Supabase here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your trading preferences and risk controls</p>
      </div>

      {/* Trading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Autonomy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Autonomy Level
            </label>
            <div className="space-y-3">
              {[0, 1, 2, 3].map((level) => (
                <label
                  key={level}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    settings.autonomy_level === level
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="autonomy_level"
                    value={level}
                    checked={settings.autonomy_level === level}
                    onChange={(e) =>
                      setSettings({ ...settings, autonomy_level: parseInt(e.target.value) })
                    }
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getAutonomyLevelLabel(level as 0 | 1 | 2 | 3)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getAutonomyLevelDescription(level as 0 | 1 | 2 | 3)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Position Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Max Concurrent Positions"
              type="number"
              min="1"
              value={settings.max_concurrent_positions}
              onChange={(e) =>
                setSettings({ ...settings, max_concurrent_positions: parseInt(e.target.value) })
              }
            />
            <Input
              label="Max Daily Orders"
              type="number"
              min="1"
              value={settings.max_daily_orders}
              onChange={(e) =>
                setSettings({ ...settings, max_daily_orders: parseInt(e.target.value) })
              }
            />
          </div>

          <Input
            label="Max Position Size (USD)"
            type="number"
            min="100"
            step="100"
            value={settings.max_position_size_usd}
            onChange={(e) =>
              setSettings({ ...settings, max_position_size_usd: parseFloat(e.target.value) })
            }
          />
        </CardContent>
      </Card>

      {/* Risk Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allow_shorting}
              onChange={(e) =>
                setSettings({ ...settings, allow_shorting: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div>
              <p className="font-medium text-gray-900">Allow Shorting</p>
              <p className="text-sm text-gray-500">
                Enable the agent to open short positions
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allow_margin}
              onChange={(e) =>
                setSettings({ ...settings, allow_margin: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <div>
              <p className="font-medium text-gray-900">Allow Margin</p>
              <p className="text-sm text-gray-500">
                Enable trading on margin (leverage)
              </p>
            </div>
          </label>

          <Select
            label="Trading Hours"
            value={settings.trading_hours}
            onChange={(e) =>
              setSettings({ ...settings, trading_hours: e.target.value })
            }
          >
            <option value="regular">Regular Hours (9:30 AM - 4:00 PM ET)</option>
            <option value="extended">Extended Hours (4:00 AM - 8:00 PM ET)</option>
          </Select>
        </CardContent>
      </Card>

      {/* Account Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Account Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">MooMoo Account</p>
              <p className="text-sm text-gray-500">Not Connected</p>
            </div>
            <Button variant="outline" disabled>
              Connect (Coming Soon)
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-1">
              📝 Phase 1: Paper Trading Only
            </p>
            <p className="text-sm text-blue-700">
              Live trading will be available in future phases. For now, all trades are simulated.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}


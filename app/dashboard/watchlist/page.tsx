'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState, EmptyIcon } from '@/components/shared/EmptyState';
import { isValidSymbol, formatDateTime } from '@/lib/utils';

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState('');

  // Mock data for now
  useEffect(() => {
    // In a real app, fetch from Supabase here
    setWatchlists([]);
  }, []);

  const handleCreateWatchlist = () => {
    if (!newWatchlistName) return;

    const newWatchlist = {
      id: Date.now().toString(),
      name: newWatchlistName,
      symbols: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWatchlists([...watchlists, newWatchlist]);
    setNewWatchlistName('');
    setIsCreateModalOpen(false);
  };

  const handleAddSymbol = (watchlistId: string) => {
    if (!newSymbol || !isValidSymbol(newSymbol.toUpperCase())) {
      alert('Please enter a valid stock symbol (1-5 letters)');
      return;
    }

    setWatchlists(watchlists.map(w => {
      if (w.id === watchlistId) {
        return {
          ...w,
          symbols: [...w.symbols, newSymbol.toUpperCase()],
          updated_at: new Date().toISOString(),
        };
      }
      return w;
    }));

    setNewSymbol('');
  };

  const handleDeleteSymbol = (watchlistId: string, symbol: string) => {
    if (!confirm(`Remove ${symbol} from watchlist?`)) return;

    setWatchlists(watchlists.map(w => {
      if (w.id === watchlistId) {
        return {
          ...w,
          symbols: w.symbols.filter((s: string) => s !== symbol),
          updated_at: new Date().toISOString(),
        };
      }
      return w;
    }));
  };

  const handleDeleteWatchlist = (watchlistId: string) => {
    if (!confirm('Delete this watchlist?')) return;
    setWatchlists(watchlists.filter(w => w.id !== watchlistId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Watchlists</h1>
          <p className="text-gray-500 mt-1">Track stocks and monitor opportunities</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + New Watchlist
        </Button>
      </div>

      {/* Watchlists */}
      {watchlists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={<EmptyIcon />}
              title="No watchlists yet"
              description="Create your first watchlist to start tracking stocks"
              action={{
                label: 'Create Watchlist',
                onClick: () => setIsCreateModalOpen(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {watchlists.map((watchlist) => (
            <Card key={watchlist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{watchlist.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {watchlist.symbols.length} symbols • Updated {formatDateTime(watchlist.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteWatchlist(watchlist.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add Symbol Form */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Symbol (e.g., AAPL)"
                    value={selectedWatchlist === watchlist.id ? newSymbol : ''}
                    onChange={(e) => {
                      setSelectedWatchlist(watchlist.id);
                      setNewSymbol(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSymbol(watchlist.id);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddSymbol(watchlist.id)}
                  >
                    Add
                  </Button>
                </div>

                {/* Symbols List */}
                {watchlist.symbols.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No symbols yet. Add one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {watchlist.symbols.map((symbol: string) => (
                      <div
                        key={symbol}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{symbol}</span>
                          <Badge variant="default">Paper</Badge>
                        </div>
                        <button
                          onClick={() => handleDeleteSymbol(watchlist.id, symbol)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Watchlist Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Watchlist"
        description="Give your watchlist a descriptive name"
      >
        <div className="space-y-4">
          <Input
            label="Watchlist Name"
            placeholder="e.g., Tech Giants, EV Sector"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateWatchlist();
              }
            }}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


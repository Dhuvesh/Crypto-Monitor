import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Bell, ArrowUp, ArrowDown, AlertTriangle, X } from 'lucide-react';

interface CryptoData {
  id: string;
  name: string;
  price: number;
  change24h: number;
}

interface Alert {
  cryptoId: string;
  targetPrice: number;
  condition: 'above' | 'below';
}

const socket = io('http://localhost:5000');

function App() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [ alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isSettingAlert, setIsSettingAlert] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to server'));
    socket.on('connect_error', (error) => console.error('Connection error:', error));
    socket.on('priceUpdate', (data: CryptoData[]) => setCryptoData(data));
    socket.on('alertTriggered', (data) => {
      setAlertMessage(`Alert: ${data.name} is now ${data.condition} $${data.targetPrice}`);
      setTimeout(() => setAlertMessage(null), 5000);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('priceUpdate');
      socket.off('alertTriggered');
    };
  }, []);

  const handleSetAlert = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    setIsSettingAlert(true);
  };

  const submitAlert = () => {
    if (selectedCrypto && targetPrice && condition) {
      const newAlert: Alert = {
        cryptoId: selectedCrypto,
        targetPrice: parseFloat(targetPrice),
        condition
      };
      setAlert(newAlert);
      socket.emit('setAlert', newAlert);
      setIsSettingAlert(false);
      setTargetPrice('');
      setSelectedCrypto(null);
    }
  };
  console.log(cryptoData);

  const removeAlert = () => {
    setAlert(null);
    socket.emit('removeAlert');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Crypto Monitor
          </h1>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-green-400 mr-2">●</span>
              <span className="text-gray-400">Live Updates</span>
            </div>
            <div className="text-gray-400 font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mb-8">
          {(alertMessage || alert) && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="mr-2 text-yellow-400" />
                Active Alerts
              </h2>
              <div className="space-y-4">
                {alertMessage && (
                  <div className="p-4 bg-yellow-400 bg-opacity-20 border border-yellow-400 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="text-yellow-400" />
                      <span className="text-yellow-100">{alertMessage}</span>
                    </div>
                    <button
                      onClick={() => setAlertMessage(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                {alert && (
                  <div className="p-4 bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="text-blue-400" />
                      <span className="text-blue-100">
                        Watching {cryptoData.find(c => c.id === alert.cryptoId)?.name} for price {alert.condition} ${alert.targetPrice}
                      </span>
                    </div>
                    <button
                      onClick={removeAlert}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Crypto Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {cryptoData.map((crypto) => (
            <div
              key={crypto.id}
              className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 relative overflow-hidden"
            >
              {alert?.cryptoId === crypto.id && (
                <div className="absolute top-0 right-0 w-16 h-16">
                  <div className="absolute transform rotate-45 bg-blue-500 text-white text-xs py-1 right-[-35px] top-[32px] w-[170px] text-center">
                    Alert Active
                  </div>
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">{crypto.name}</h2>
                  <p className="text-3xl font-bold text-white">
                    ${crypto.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleSetAlert(crypto.id)}
                  className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300 hover:text-white"
                >
                  <Bell size={20} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                    crypto.change24h >= 0
                      ? 'text-green-400 bg-green-400 bg-opacity-10'
                      : 'text-red-400 bg-red-400 bg-opacity-10'
                  }`}
                >
                  {crypto.change24h >= 0 ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Modal */}
        {isSettingAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Bell className="mr-2 text-blue-400" />
                Set Price Alert
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">Target Price</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter price..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Condition</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCondition('above')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        condition === 'above'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Above
                    </button>
                    <button
                      onClick={() => setCondition('below')}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        condition === 'below'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Below
                    </button>
                  </div>
                </div>
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setIsSettingAlert(false)}
                    className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAlert}
                    className="flex-1 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Set Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
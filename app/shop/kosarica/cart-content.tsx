'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-context';

export function CartContent() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();

  const subtotal = getTotal();
  const pdv = subtotal * 0.25;
  const total = subtotal + pdv;

  const handleCheckout = () => {
    toast.info('Plaćanje uskoro!', {
      description: 'Online plaćanje bit će dostupno uskoro. Hvala na strpljenju!',
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-2">Vaša košarica je prazna</h1>
          <p className="text-muted-foreground mb-6">Dodajte proizvode iz našeg shopa i počnite kupovinu!</p>
          <Link href="/shop">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Idi u shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Nastavi kupovinu
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold mb-8">Košarica ({items.length})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={item.product.id} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/shop/${item.product.slug}`} className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl flex items-center justify-center text-3xl">
                      {item.product.emoji}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/shop/${item.product.slug}`} className="font-semibold text-sm hover:text-orange-600 transition-colors line-clamp-1">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                          {item.selectedVariant && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.selectedVariant}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-30"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-orange-600">
                          {(item.product.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-1.5" />
                Isprazni košaricu
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <Card className="border-0 shadow-sm sticky top-20">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Sažetak narudžbe</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Međuzbroj</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PDV (25%)</span>
                    <span>{pdv.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dostava</span>
                    <span className="text-green-600 font-medium">Besplatna</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Ukupno</span>
                    <span className="text-orange-600">{total.toFixed(2)} €</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-lg py-6 shadow-lg shadow-orange-200/50"
                  onClick={handleCheckout}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Nastavi na plaćanje
                </Button>
                <Link href="/shop" className="block text-center mt-3">
                  <Button variant="ghost" className="w-full text-gray-500 hover:text-orange-500">
                    Nastavi kupovinu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

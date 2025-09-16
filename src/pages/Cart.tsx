import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { createCartPayment, captureCartPayment } from '@/lib/cartCheckout';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, clear, totalCount, subTotal, discountTotal, vatTotal, grandTotal, applyPromo, removePromo, activePromo, creditsInCart, currency } = useCart();
  const [promoCode, setPromoCode] = React.useState('');
  const [promoStatus, setPromoStatus] = React.useState<'idle'|'ok'|'err'>('idle');
  const [creating, setCreating] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  // Capture mock (simulate payment success via query params)
  React.useEffect(() => {
    const mockPaid = searchParams.get('mockPaid');
    const orderIdParam = searchParams.get('orderId');
    if (mockPaid && orderIdParam && !creating) {
      (async ()=> {
        try {
          const res = await captureCartPayment(orderIdParam);
          if (res.success || res.already) {
            toast({ title: 'Paiement confirmé', description: res.already ? 'Commande déjà payée' : 'Crédits ajoutés.' });
            clear();
          }
        } catch (e:any) {
          toast({ title: 'Erreur capture', description: e.message, variant: 'destructive' });
        } finally {
          setSearchParams(prev => { prev.delete('mockPaid'); prev.delete('orderId'); return prev; });
        }
      })();
    }
  }, [searchParams]);

  async function handleCheckout() {
    try {
      setCreating(true);
      const res = await createCartPayment(items, activePromo || undefined);
      setOrderId(res.orderId);
      window.open(res.checkoutUrl, '_blank');
      toast({ title: 'Paiement', description: 'Fenêtre de paiement ouverte (mock).' });
    } catch (e:any) {
      toast({ title: 'Erreur paiement', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-aurora opacity-5" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-cosmic rounded-2xl glow animate-fade-in">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Panier
            </h1>
            <p className="text-purple-100/80 text-lg">
              {totalCount > 0 ? `${totalCount} article${totalCount>1?'s':''} dans votre panier` : 'Aucun article pour le moment'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Panier vide</CardTitle>
              <CardDescription>Ajoutez des articles depuis la boutique ou le catalogue.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <Card key={item.id} className="glass-card border-white/10 hover:border-white/20 transition-all">
                  <CardContent className="p-4 flex gap-4 items-center">
                    {item.imageUrl ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-cosmic flex items-center justify-center text-white font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{item.name}</h3>
                      <p className="text-sm text-purple-100/70">{item.price.toFixed(2)} € / unité</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-6 text-center font-medium">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-white">
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                  <CardDescription>Vérifiez votre commande</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total (HT)</span>
                    <span>{subTotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remise</span>
                    <span className={discountTotal>0? 'text-green-400' : ''}>-{discountTotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm text-purple-100/70">
                    <span>TVA (estimée)</span>
                    <span>{vatTotal.toFixed(2)} {currency}</span>
                  </div>
                  {creditsInCart>0 && (
                    <div className="flex justify-between text-sm text-purple-100/80">
                      <span>Crédits potentiels</span>
                      <span className="font-medium text-teal-300">+{creditsInCart}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between font-semibold text-white">
                    <span>Total</span>
                    <span>{grandTotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={promoCode}
                        onChange={e=>{setPromoCode(e.target.value); setPromoStatus('idle');}}
                        placeholder="Code promo"
                        className="flex-1 bg-white/10 px-3 py-2 rounded-md text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                      />
                      {activePromo ? (
                        <Button variant="outline" className="border-white/20" onClick={()=>{removePromo(); setPromoCode(''); setPromoStatus('idle');}}>Retirer</Button>
                      ) : (
                        <Button variant="outline" className="border-white/20" onClick={()=>{
                          const ok = applyPromo(promoCode);
                          setPromoStatus(ok? 'ok':'err');
                        }}>Appliquer</Button>
                      )}
                    </div>
                    {promoStatus==='ok' && <p className="text-xs text-green-400">Code appliqué ✔</p>}
                    {promoStatus==='err' && <p className="text-xs text-red-400">Code invalide</p>}
                    {activePromo && <p className="text-xs text-teal-300">Promo active: {activePromo}</p>}
                  </div>
                  <Button disabled={!items.length || creating} onClick={handleCheckout} className="w-full bg-gradient-turquoise hover:scale-[1.02] transition-all disabled:opacity-60">
                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Préparation...</> : <>Procéder au paiement <ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                  <Button variant="outline" className="w-full text-cyan-100 border-cyan-500/20 hover:bg-cyan-500/10" onClick={clear}>
                    Vider le panier
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

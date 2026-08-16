/* WDW Guide — Service Worker
   Habilita notificações mesmo com o app em background (aba minimizada).
   Não requer backend — as notificações são disparadas pela própria página
   via postMessage e o SW as exibe via showNotification.
*/
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

// Exibe a notificação — usado por ambos os listeners abaixo
function showNotif(title, body, tag) {
  return self.registration.showNotification(title || 'WDW Guide', {
    body:     body || '',
    tag:      tag  || 'wdw-alert',
    renotify: true,
    vibrate:  [200, 100, 200],
  });
}

// Recebe mensagem da página principal (postMessage) — app em background
self.addEventListener('message', function(e) {
  if(!e.data || e.data.type !== 'WDW_NOTIFY') return;
  e.waitUntil(showNotif(e.data.title, e.data.body, e.data.tag));
});

// Recebe push event — disparado pelo DevTools ou por um servidor futuro
self.addEventListener('push', function(e) {
  var title = 'WDW Guide';
  var body  = 'Nova notificacao do parque.';
  var tag   = 'wdw-push';
  if(e.data) {
    try {
      var d = e.data.json();
      title = d.title || title;
      body  = d.body  || body;
      tag   = d.tag   || tag;
    } catch(_) {
      body = e.data.text() || body;
    }
  }
  e.waitUntil(showNotif(title, body, tag));
});

// Clique na notificação — foca o app ou abre uma nova aba
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      for(var i = 0; i < clients.length; i++) {
        if(clients[i].url && 'focus' in clients[i]) return clients[i].focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow('/disney-guide/');
    })
  );
});

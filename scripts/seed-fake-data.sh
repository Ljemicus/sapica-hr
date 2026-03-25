#!/bin/bash
# Seed Šapica database with realistic fake data
set -e

cd "$(dirname "$0")/.."

SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

API="$SUPABASE_URL/rest/v1"
HEADERS=(-H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal")

post() {
  local table=$1
  local data=$2
  local res=$(curl -s -w "%{http_code}" -o /dev/null "$API/$table" "${HEADERS[@]}" -d "$data")
  if [ "$res" = "201" ] || [ "$res" = "200" ]; then
    echo "  ✅ $table"
  else
    echo "  ❌ $table ($res)"
    curl -s "$API/$table" "${HEADERS[@]}" -d "$data"
    echo ""
  fi
}

echo "🐾 Seeding Šapica database..."

# ── OWNERS (5 vlasnika) ──
echo ""
echo "👤 Adding owners..."
post "users" '[
  {"id":"c1111111-1111-1111-1111-111111111111","email":"tea.markovic@gmail.com","full_name":"Tea Marković","role":"owner","phone":"+385912345001","city":"Rijeka"},
  {"id":"c2222222-2222-2222-2222-222222222222","email":"ante.perko@gmail.com","full_name":"Ante Perko","role":"owner","phone":"+385912345002","city":"Zagreb"},
  {"id":"c3333333-3333-3333-3333-333333333333","email":"marina.simic@gmail.com","full_name":"Marina Šimić","role":"owner","phone":"+385912345003","city":"Split"},
  {"id":"c4444444-4444-4444-4444-444444444444","email":"josip.boric@gmail.com","full_name":"Josip Borić","role":"owner","phone":"+385912345004","city":"Rijeka"},
  {"id":"c5555555-5555-5555-5555-555555555555","email":"karla.vukovic@gmail.com","full_name":"Karla Vuković","role":"owner","phone":"+385912345005","city":"Zagreb"}
]'

# ── PETS (10 ljubimaca) ──
echo ""
echo "🐕 Adding pets..."
post "pets" '[
  {"id":"d1111111-1111-1111-1111-111111111111","owner_id":"c1111111-1111-1111-1111-111111111111","name":"Rex","species":"dog","breed":"Njemački ovčar","age":4,"weight":32.5,"special_needs":null,"photo_url":"https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400"},
  {"id":"d2222222-2222-2222-2222-222222222222","owner_id":"c1111111-1111-1111-1111-111111111111","name":"Mici","species":"cat","breed":"Perzijska","age":3,"weight":4.2,"special_needs":"Osjetljiv želudac, specijalana hrana","photo_url":"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"},
  {"id":"d3333333-3333-3333-3333-333333333333","owner_id":"c2222222-2222-2222-2222-222222222222","name":"Luna","species":"dog","breed":"Zlatni retriver","age":2,"weight":28.0,"special_needs":null,"photo_url":"https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"},
  {"id":"d4444444-4444-4444-4444-444444444444","owner_id":"c2222222-2222-2222-2222-222222222222","name":"Čarli","species":"dog","breed":"Francuski buldog","age":5,"weight":12.0,"special_needs":"Problemi s disanjem po vrućini","photo_url":"https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"},
  {"id":"d5555555-5555-5555-5555-555555555555","owner_id":"c3333333-3333-3333-3333-333333333333","name":"Bella","species":"dog","breed":"Labrador","age":6,"weight":30.0,"special_needs":null,"photo_url":"https://images.unsplash.com/photo-1579296774624-9e82ef705092?w=400"},
  {"id":"d6666666-6666-6666-6666-666666666666","owner_id":"c3333333-3333-3333-3333-333333333333","name":"Whiskers","species":"cat","breed":"Britanska kratkodlaka","age":4,"weight":5.5,"special_needs":null,"photo_url":"https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400"},
  {"id":"d7777777-7777-7777-7777-777777777777","owner_id":"c4444444-4444-4444-4444-444444444444","name":"Max","species":"dog","breed":"Border koli","age":3,"weight":20.0,"special_needs":"Hiperaktivan, treba puno šetnje","photo_url":"https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400"},
  {"id":"d8888888-8888-8888-8888-888888888888","owner_id":"c4444444-4444-4444-4444-444444444444","name":"Bubi","species":"dog","breed":"Maltežanac","age":7,"weight":3.5,"special_needs":"Lijek za srce 2x dnevno","photo_url":"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"},
  {"id":"d9999999-9999-9999-9999-999999999999","owner_id":"c5555555-5555-5555-5555-555555555555","name":"Rocky","species":"dog","breed":"Husky","age":3,"weight":25.0,"special_needs":"Treba klimu ljeti","photo_url":"https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400"},
  {"id":"da111111-1111-1111-1111-111111111111","owner_id":"c5555555-5555-5555-5555-555555555555","name":"Nala","species":"cat","breed":"Maine Coon","age":2,"weight":6.0,"special_needs":null,"photo_url":"https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400"}
]'

# ── BOOKINGS (8 bookinga) ──
echo ""
echo "📅 Adding bookings..."
post "bookings" '[
  {"id":"e1111111-1111-1111-1111-111111111111","owner_id":"c1111111-1111-1111-1111-111111111111","sitter_id":"a3333333-3333-3333-3333-333333333333","pet_id":"d1111111-1111-1111-1111-111111111111","service_type":"boarding","start_date":"2026-03-15","end_date":"2026-03-18","status":"completed","total_price":150.00,"note":"Rex voli šetnje ujutro i navečer"},
  {"id":"e2222222-2222-2222-2222-222222222222","owner_id":"c2222222-2222-2222-2222-222222222222","sitter_id":"a1111111-1111-1111-1111-111111111111","pet_id":"d3333333-3333-3333-3333-333333333333","service_type":"walking","start_date":"2026-03-20","end_date":"2026-03-20","status":"completed","total_price":20.00,"note":"Luna obožava park Maksimir"},
  {"id":"e3333333-3333-3333-3333-333333333333","owner_id":"c3333333-3333-3333-3333-333333333333","sitter_id":"b1111111-1111-1111-1111-111111111111","pet_id":"d5555555-5555-5555-5555-555555555555","service_type":"daycare","start_date":"2026-03-22","end_date":"2026-03-22","status":"completed","total_price":35.00,"note":null},
  {"id":"e4444444-4444-4444-4444-444444444444","owner_id":"c4444444-4444-4444-4444-444444444444","sitter_id":"a4444444-4444-4444-4444-444444444444","pet_id":"d7777777-7777-7777-7777-777777777777","service_type":"walking","start_date":"2026-03-25","end_date":"2026-03-25","status":"accepted","total_price":15.00,"note":"Max treba duže šetnje, minimalno sat vremena"},
  {"id":"e5555555-5555-5555-5555-555555555555","owner_id":"c1111111-1111-1111-1111-111111111111","sitter_id":"a3333333-3333-3333-3333-333333333333","pet_id":"d2222222-2222-2222-2222-222222222222","service_type":"house-sitting","start_date":"2026-03-28","end_date":"2026-04-02","status":"pending","total_price":250.00,"note":"Mici jede samo Royal Canin Indoor"},
  {"id":"e6666666-6666-6666-6666-666666666666","owner_id":"c5555555-5555-5555-5555-555555555555","sitter_id":"a8888888-8888-8888-8888-888888888888","pet_id":"d9999999-9999-9999-9999-999999999999","service_type":"boarding","start_date":"2026-04-05","end_date":"2026-04-10","status":"pending","total_price":350.00,"note":"Rocky treba klimatizirani prostor"},
  {"id":"e7777777-7777-7777-7777-777777777777","owner_id":"c2222222-2222-2222-2222-222222222222","sitter_id":"a5555555-5555-5555-5555-555555555555","pet_id":"d4444444-4444-4444-4444-444444444444","service_type":"drop-in","start_date":"2026-03-23","end_date":"2026-03-23","status":"completed","total_price":15.00,"note":"Čarli treba lijek u 14h"},
  {"id":"e8888888-8888-8888-8888-888888888888","owner_id":"c3333333-3333-3333-3333-333333333333","sitter_id":"b2222222-2222-2222-2222-222222222222","pet_id":"d6666666-6666-6666-6666-666666666666","service_type":"boarding","start_date":"2026-04-01","end_date":"2026-04-03","status":"accepted","total_price":120.00,"note":"Whiskers je tih ali voli maženje"}
]'

# ── REVIEWS (10 recenzija) ──
echo ""
echo "⭐ Adding reviews..."
post "reviews" '[
  {"id":"f1111111-1111-1111-1111-111111111111","booking_id":"e1111111-1111-1111-1111-111111111111","reviewer_id":"c1111111-1111-1111-1111-111111111111","reviewee_id":"a3333333-3333-3333-3333-333333333333","rating":5,"comment":"Ivana je fantastična! Rex se vratio sretan i zadovoljan. Slala mi je slike svaki dan. Apsolutno preporučam!"},
  {"id":"f2222222-2222-2222-2222-222222222222","booking_id":"e2222222-2222-2222-2222-222222222222","reviewer_id":"c2222222-2222-2222-2222-222222222222","reviewee_id":"a1111111-1111-1111-1111-111111111111","rating":5,"comment":"Ana je predivna s Lunom. Profesionalna, pouzdana i očito voli životinje. Top!"},
  {"id":"f3333333-3333-3333-3333-333333333333","booking_id":"e3333333-3333-3333-3333-333333333333","reviewer_id":"c3333333-3333-3333-3333-333333333333","reviewee_id":"b1111111-1111-1111-1111-111111111111","rating":4,"comment":"Tomislav je super, Bella se zabavila. Jedino malo kasno odgovara na poruke ali inače sve pet."},
  {"id":"f4444444-4444-4444-4444-444444444444","booking_id":"e7777777-7777-7777-7777-777777777777","reviewer_id":"c2222222-2222-2222-2222-222222222222","reviewee_id":"a5555555-5555-5555-5555-555555555555","rating":5,"comment":"Maja je točno u minut došla, dala lijek Čarliju i poslala video. Jako profesionalno!"},
  {"id":"f5555555-5555-5555-5555-555555555555","booking_id":"e1111111-1111-1111-1111-111111111111","reviewer_id":"c4444444-4444-4444-4444-444444444444","reviewee_id":"a3333333-3333-3333-3333-333333333333","rating":5,"comment":"Drugi put kod Ivane i opet savršeno. Max je obožava, vuče me prema njenoj kući kad idemo u šetnju 😂"},
  {"id":"f6666666-6666-6666-6666-666666666666","booking_id":"e2222222-2222-2222-2222-222222222222","reviewer_id":"c5555555-5555-5555-5555-555555555555","reviewee_id":"a1111111-1111-1111-1111-111111111111","rating":4,"comment":"Ana je odlična, Rocky je bio sretan. Malo mala kuća za velikog psa ali se snašla."},
  {"id":"f7777777-7777-7777-7777-777777777777","booking_id":"e3333333-3333-3333-3333-333333333333","reviewer_id":"c1111111-1111-1111-1111-111111111111","reviewee_id":"a4444444-4444-4444-4444-444444444444","rating":5,"comment":"Luka je odličan! Rex se s njim super slaže. Šetnje uz more su Rexov omiljeni dio."},
  {"id":"f8888888-8888-8888-8888-888888888888","booking_id":"e2222222-2222-2222-2222-222222222222","reviewer_id":"c3333333-3333-3333-3333-333333333333","reviewee_id":"b1111111-1111-1111-1111-111111111111","rating":5,"comment":"Tomislav je pravi profesionalac, Bella ga obožava. Uvijek pošalje fotke i update."},
  {"id":"f9999999-9999-9999-9999-999999999999","booking_id":"e7777777-7777-7777-7777-777777777777","reviewer_id":"c4444444-4444-4444-4444-444444444444","reviewee_id":"a8888888-8888-8888-8888-888888888888","rating":4,"comment":"Ivan je super čuvar, kuća mu je čista i prostrana. Bubi se dobro osjećao."},
  {"id":"fa111111-1111-1111-1111-111111111111","booking_id":"e3333333-3333-3333-3333-333333333333","reviewer_id":"c2222222-2222-2222-2222-222222222222","reviewee_id":"a5555555-5555-5555-5555-555555555555","rating":5,"comment":"Maja je nešto posebno. Luna joj se odmah dala u naručje. Preporučam svima!"}
]'

# ── MESSAGES (12 poruka u 3 razgovora) ──
echo ""
echo "💬 Adding messages..."
post "messages" '[
  {"sender_id":"c1111111-1111-1111-1111-111111111111","receiver_id":"a3333333-3333-3333-3333-333333333333","booking_id":"e5555555-5555-5555-5555-555555555555","content":"Bok Ivana! Zanima me je li još uvijek slobodna za čuvanje Mici od 28.3. do 2.4.?","read":true},
  {"sender_id":"a3333333-3333-3333-3333-333333333333","receiver_id":"c1111111-1111-1111-1111-111111111111","booking_id":"e5555555-5555-5555-5555-555555555555","content":"Bok Tea! Da, slobodna sam. Koliko puta dnevno jede Mici i ima li neki poseban režim?","read":true},
  {"sender_id":"c1111111-1111-1111-1111-111111111111","receiver_id":"a3333333-3333-3333-3333-333333333333","booking_id":"e5555555-5555-5555-5555-555555555555","content":"Super! Jede 2x dnevno, ujutro i navečer. Royal Canin Indoor, donijeti ću hranu. Osjetljiv joj je želudac pa neka ne dobiva ništa drugo.","read":true},
  {"sender_id":"a3333333-3333-3333-3333-333333333333","receiver_id":"c1111111-1111-1111-1111-111111111111","booking_id":"e5555555-5555-5555-5555-555555555555","content":"Razumijem, sve ću zapisati. Imate li broj veterinara za svaki slučaj?","read":false},

  {"sender_id":"c4444444-4444-4444-4444-444444444444","receiver_id":"a4444444-4444-4444-4444-444444444444","booking_id":"e4444444-4444-4444-4444-444444444444","content":"Ej Luka, Max je spreman za šetnju danas! Može oko 16h?","read":true},
  {"sender_id":"a4444444-4444-4444-4444-444444444444","receiver_id":"c4444444-4444-4444-4444-444444444444","booking_id":"e4444444-4444-4444-4444-444444444444","content":"Može, dolazim u 16h. Idem li s njim uz Rječinu ili preferiraš park?","read":true},
  {"sender_id":"c4444444-4444-4444-4444-444444444444","receiver_id":"a4444444-4444-4444-4444-444444444444","booking_id":"e4444444-4444-4444-4444-444444444444","content":"Rječina bi bila super, voli vodu! Samo pazi da ga ne pustiš s povodca blizu ceste.","read":true},
  {"sender_id":"a4444444-4444-4444-4444-444444444444","receiver_id":"c4444444-4444-4444-4444-444444444444","booking_id":"e4444444-4444-4444-4444-444444444444","content":"Naravno, uvijek je na povodcu dok ne dođemo do travnate površine. Vidimo se!","read":false},

  {"sender_id":"c5555555-5555-5555-5555-555555555555","receiver_id":"a8888888-8888-8888-8888-888888888888","booking_id":"e6666666-6666-6666-6666-666666666666","content":"Hej Ivan, vidjela sam da nudiš smještaj za veće pse. Imam huskyja, Rocky, 25kg. Imate li klimu?","read":true},
  {"sender_id":"a8888888-8888-8888-8888-888888888888","receiver_id":"c5555555-5555-5555-5555-555555555555","booking_id":"e6666666-6666-6666-6666-666666666666","content":"Bok Karla! Da, imam klimatizirani prostor i veliki dvorište. Rocky bi uživao! Od kad do kad trebate?","read":true},
  {"sender_id":"c5555555-5555-5555-5555-555555555555","receiver_id":"a8888888-8888-8888-8888-888888888888","booking_id":"e6666666-6666-6666-6666-666666666666","content":"5.-10. travnja. Idemo na put i nemamo kome ostaviti. Koliko bi izašlo za 5 noći?","read":true},
  {"sender_id":"a8888888-8888-8888-8888-888888888888","receiver_id":"c5555555-5555-5555-5555-555555555555","booking_id":"e6666666-6666-6666-6666-666666666666","content":"Za 5 noći bi bilo 350€, uključuje šetnje 2x dnevno i hranjenje. Donijeti ću vam fotke svaki dan!","read":false}
]'

echo ""
echo "🐾 Seed complete!"
echo "   - 5 owners, 10 pets, 8 bookings, 10 reviews, 12 messages"

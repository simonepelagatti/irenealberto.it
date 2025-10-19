-- ============================================
-- SEED DATA: 24 Travel Experiences
-- Based on CSV: Esperienze completo.xlsx
-- ============================================

-- Insert all 24 experiences from the Chile/Argentina/Brazil honeymoon trip
INSERT INTO experiences (id, title, description, image_url, total_packages, packages_sold, unit_price, total_value, display_order, is_active) VALUES

-- 1. CHILE: Flights & Santiago
('volo-italia-cile', 'Dall''Italia al Cile', '…si parte! Il 31 dicembre saremo in volo sull''oceano Atlantico dove festeggeremo il Capodanno. Dopo uno scalo a San Paolo in Brasile, finalmente atterreremo in terra cilena.', 'volo-italia-cile.jpg', 15, 0, 75.00, 1125.00, 1, true),

('santiago-del-cile', 'Soggiorno a Santiago del Cile', 'Visiteremo la capitale Santiago del Cile incastonata tra le Ande e la Cordigliera della Costa. Passeggeremo nella storica Plaza de Armas, cuore pulsante della città. Attraverseremo il Barrio Bellavista, dove murales, botteghe d''arte e locali animano le strade. Al Mercado Central scopriremo i sapori autentici della cucina cilena. Saliremo poi sul Cerro San Cristòbal, dal quale si apre lo spettacolo della città distesa ai piedi delle montagne.', 'santiago-del-cile.jpg', 5, 0, 150.00, 750.00, 2, true),

('valparaiso', 'Valparaíso', 'La città portuale più affascinante del Cile, dichiarata patrimonio dell''UNESCO. I suoi vicoli pittoreschi, le case color pastello e i murales ne fanno un museo a cielo aperto. Qui si respira l''anima autentica del Cile, tra poesia e un''atmosfera unica che ha ispirato Pablo Neruda nella sua casa museo La Sebastiana.', 'valparaiso.jpg', 8, 0, 50.00, 400.00, 3, true),

-- 2. ATACAMA DESERT
('volo-san-pedro-atacama', 'Lasciamo la città per immergerci nella natura', 'Voleremo a San Pedro De Atacama, a 1600 km di distanza, nel nord del Cile, un pittoresco villaggio nel cuore del deserto più arido del mondo.', 'san-pedro-atacama.jpg', 10, 0, 75.00, 750.00, 4, true),

('valle-della-luna', 'Valle della Luna', 'Al tramonto visiteremo la Valle Della Luna, uno dei paesaggi più surreali del Deserto di Atacama. Con le sue dune dorate, le rocce scolpite dal vento e le distese di sale che brillano al sole, sembra davvero di camminare sulla superficie lunare. Al calar del sole poi, le montagne e le formazioni rocciose si tingono di rosso, arancio e viola, in uno degli spettacoli più emozionanti del Cile.', 'valle-della-luna.jpg', 8, 0, 50.00, 400.00, 5, true),

('salar-de-atacama', 'Salar de Atacama', 'Il Salar de Atacama è la più grande distesa salata del Cile, incastonata nel cuore del deserto più arido del mondo. Un paesaggio unico dove l''acqua delle lagune contrasta con il bianco abbagliante del sale e lo sfondo maestoso delle Ande. Potremo ammirare le colonie di fenicotteri rosa che popolano le lagune e scoprire la natura che resiste in questo ambiente estremo.', 'salar-de-atacama.jpg', 6, 0, 100.00, 600.00, 6, true),

('piedras-rojas', 'Piedras Rojas', 'Piedras Rojas è uno dei luoghi più suggestivi dell''altopiano andino cileno. Qui il paesaggio sorprende con il contrasto spettacolare tre le rocce rossastre di origine vulcanica, le lagune dalle sfumature turchesi e lo sfondo imponente delle Ande.', 'piedras-rojas.jpg', 6, 0, 100.00, 600.00, 7, true),

('lagune-altiplaniche', 'Lagune Altiplaniche', 'Visiteremo le Lagune Altiplaniche, gemme incastonate a oltre 4.000 m di altitudine nel cuore dell''Atacama. Tra le più famose, Miscanti e Miniques, che sorprendono con le loro acque blu intenso circondate da vulcani imponenti e distese infinite di deserto. Scopriremo anche la fauna endemica della zona, fra cui vigogne, volpi e fenicotteri.', 'lagune-altiplaniche.jpg', 6, 0, 100.00, 600.00, 8, true),

('geiser-el-tatio', 'Geiser di El Tatio', 'Visiteremo i Geyser del Tatio, il campo geotermico più alto del mondo, situato a oltre 4000 m di altitudine nel deserto di Atacama. All''alba, con la luce dorata del sole, assisteremo allo spettacolo dei getti d''acqua e le colonne di vapore che emergono dal cuore della terra. Tra lagune ghiacciate e fauna d''alta quota come vigogne e lama, vivremo un''esperienza unica del paesaggio andino.', 'geiser-el-tatio.jpg', 6, 0, 50.00, 300.00, 9, true),

-- 3. PATAGONIA CILENA
('volo-punta-arenas', 'Sorvolando il lungo petalo di mare', 'In volo, attraverseremo da nord a sud il Cile, per oltre 4,000 km, verso Punta Arenas, vivace città della Patagonia affacciata sullo Stretto di Magellano.', 'punta-arenas.jpg', 10, 0, 75.00, 750.00, 10, true),

('isla-magdalena', 'Isla Magdalena', 'Ci imbarcheremo all''alba verso Isla Magdalena, una piccola isola situata nello Stretto di Magellano, celebre per ospitare una delle colonie di pinguini di Magellano più numerose del Cile. Potremo osservare da vicino migliaia di pinguini nel loro habitat naturale, insieme a leoni marini, cormorani e altre specie marine. L''atmosfera selvaggia e il paesaggio incontaminato di Isla Magdalena ci avvicineranno alla natura autentica della Patagonia cilena.', 'isla-magdalena.jpg', 15, 0, 100.00, 1500.00, 11, true),

('torres-del-paine', 'Parco Nazionale del Paine', 'Ci addentreremo nel Parco Nazionale Torres del Paine, icona della Patagonia cilena. Tra imponenti torri di granito, laghi color turchese, ghiacciai millenari e vaste steppe popolate da guanachi e condor, il parco ci regalerà scenari di incomparabile bellezza. Faremo un trekking sul sentiero che conduce a viste mozzafiato sulle celebri Torres, simbolo del parco.', 'torres-del-paine.jpg', 15, 0, 50.00, 750.00, 12, true),

-- 4. PATAGONIA ARGENTINA
('bus-argentina', 'Verso la Patagonia Argentina', 'Con un pullman notturno viaggeremo dalla patagonia cilena a quella argentina, verso El Calafate, cittadina situata sul Lago Argentino.', 'bus-patagonia.jpg', 10, 0, 50.00, 500.00, 13, true),

('perito-moreno', 'Perito Moreno', 'Nel Parque Nacional Los Glaciares ammireremo il ghiacciaio Perito Moreno, che si estende per oltre 30 km. Uno dei luoghi più spettacolari della Patagonia e tra i pochi ghiacciai al mondo ancora in avanzamento. Camminando sulle passerelle panoramiche potremo contemplare da vicino la suggestiva parete di ghiaccio che si staglia nelle acque del Lago Argentino.', 'perito-moreno.jpg', 10, 0, 100.00, 1000.00, 14, true),

('todo-glaciares', 'Tour in Barca Todo Glaciares', 'Navigheremo sul Lago Argentino, situato all''interno del Parco Nazionale Los Glaciares. Ammireremo i principali ghiacciai: Upsala, Seco, Heim Sur, Peineta e Spegazzini. Sbarcheremo alla base Spegazzini, un''area appositamente progettata per una visita privilegiata sul Ghiacciaio Spegazzini. Durante la sosta potremo anche fare una passeggiata attraverso la caratteristica foresta patagonica.', 'todo-glaciares.jpg', 4, 0, 200.00, 800.00, 15, true),

-- 5. BUENOS AIRES
('volo-buenos-aires', 'Dalla Patagonia a Buenos Aires', 'Raggiungeremo in aereo Buenos Aires, la capitale dell''Argentina.', 'volo-buenos-aires.jpg', 15, 0, 75.00, 1125.00, 16, true),

('buenos-aires', 'Soggiorno a Buenos Aires', 'Visiteremo Buenos Aires, la capitale dell''Argentina, conosciuta per la sua eleganza e il suo spirito cosmopolita. Passeggeremo lungo l''elegante Plaza de Mayo, cuore politico del paese, per poi dirigerci tra i colori di La Boca, con le sue case variopinte. Scopriremo il fascino bohemien di San Telmo, i giardini di Palermo e il lato più moderno di Puerto Madero, sul lungofiume.', 'buenos-aires.jpg', 10, 0, 200.00, 2000.00, 17, true),

('tango-argentino', 'Cena Tango Argentino', 'Ceneremo in un''atmosfera tipicamente portena, gustando le specialità della tradizione argentina, dall''inconfondibile asado alle empanadas, accompagnate dal vino locale. Durante la serata ci lasceremo trasportare dalla musica e dalla magia del tango argentino, con musicisti dal vivo e coppie di ballerini.', 'tango-argentino.jpg', 6, 0, 50.00, 300.00, 18, true),

-- 6. IGUAZU FALLS
('volo-iguazu', 'Si torna nella natura', 'Voleremo a nord, al confine con il Brasile, verso le imponenti Cascate dell''Iguazu.', 'volo-iguazu.jpg', 15, 0, 75.00, 1125.00, 19, true),

('cascate-iguazu', 'Cascate dell''Iguazú', 'Visiteremo le Cascate dell''Iguazù, una delle meraviglie naturali più straordinarie al mondo. Oltre 250 salti d''acqua immersi nella foresta subtropicale, ci offriranno uno spettacolo grandioso di potenza e bellezza. Il momento più emozionante sarà quando ammireremo la Garganta del Diablo, la cascata più imponente, dove milioni di litri d''acqua precipitano con fragore in una gola profonda, avvolta da arcobaleni e vapore.', 'cascate-iguazu.jpg', 3, 0, 150.00, 450.00, 20, true),

('parco-iguazu', 'Parco Nazionale dell''Iguazú', 'Lasceremo l''Argentina per dirigerci verso il Parco Nazionale dell''Iguazu nel versante brasiliano. Qui, il parco nazionale ha un percorso di 1200 metri. Da questo cammino potremo ammirare il Canyon del fiume Iguaçu, le cascate di Rivadavia e i Tre Moschettieri. Alla fine del percorso giungeremo al belvedere inferiore della Gola Del Diavolo col suo arcobaleno perenne.', 'parco-iguazu.jpg', 3, 0, 150.00, 450.00, 21, true),

-- 7. RETURN HOME
('volo-ritorno', 'Sulla via del ritorno', 'Termineremo il nostro viaggio con l''ultimo aereo che da Sao Paulo ci riporterà in Italia.', 'volo-ritorno.jpg', 15, 0, 75.00, 1125.00, 22, true),

-- 8. HOME RENOVATION
('back-home', 'Back Home!', 'Prima o poi torneremo a Bologna e avremo una nuova missione… ristrutturare casa! I muri perimetrali li abbiamo, mancano però...traverse, porte, finestre, ...!!', 'back-home.jpg', 1, 0, NULL, NULL, 23, true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all experiences were inserted
SELECT COUNT(*) AS total_experiences FROM experiences;
-- Expected: 23 (note: last row "back home" has no price, just IBAN donation)

-- View all experiences with availability
SELECT
  id,
  title,
  total_packages,
  packages_sold,
  (total_packages - packages_sold) AS available,
  unit_price,
  total_value
FROM experiences
ORDER BY display_order;

-- Calculate total trip value
SELECT
  SUM(total_value) AS total_trip_value
FROM experiences
WHERE unit_price IS NOT NULL;
-- Expected: ~€16,500

-- ============================================
-- NOTES
-- ============================================

-- Image files needed (upload to Supabase Storage bucket 'experience-images'):
-- 1. volo-italia-cile.jpg
-- 2. santiago-del-cile.jpg
-- 3. valparaiso.jpg
-- 4. san-pedro-atacama.jpg
-- 5. valle-della-luna.jpg
-- 6. salar-de-atacama.jpg
-- 7. piedras-rojas.jpg
-- 8. lagune-altiplaniche.jpg
-- 9. geiser-el-tatio.jpg
-- 10. punta-arenas.jpg
-- 11. isla-magdalena.jpg
-- 12. torres-del-paine.jpg
-- 13. bus-patagonia.jpg
-- 14. perito-moreno.jpg
-- 15. todo-glaciares.jpg
-- 16. volo-buenos-aires.jpg
-- 17. buenos-aires.jpg
-- 18. tango-argentino.jpg
-- 19. volo-iguazu.jpg
-- 20. cascate-iguazu.jpg
-- 21. parco-iguazu.jpg
-- 22. volo-ritorno.jpg
-- 23. back-home.jpg

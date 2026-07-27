(() => {
  "use strict";

  window.TRAVEL_REVERIE_BUILD = "7.2-modular-route-cards";
  console.info("[Travel Reverie] build 7.2-modular-route-cards loaded");

  if ("caches" in window) {
    caches.keys().then(keys => {
      keys
        .filter(key => /travel[-_ ]?reverie/i.test(key) && !/4\.1/i.test(key))
        .forEach(key => caches.delete(key));
    }).catch(() => {});
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  // V7 keeps each user-owned domain in its own browser record.  This mirrors
  // the project-file layout planned for the desktop app and prevents a journal
  // save from being able to overwrite route data by accident.
  const SETTINGS_STORAGE_KEY = "travelReverieSettingsV7";
  const JOURNAL_STORAGE_KEY = "travelReverieJournalV7";
  const ROUTES_STORAGE_KEY = "travelReverieRoutesV7";
  const LEGACY_STATE_KEY = "travelReverieStateV6";
  const LEGACY_KEYS = ["travelReverieStateV5", "travelReverieStateV4", "travelReverieStateV3", "travelReverieStateV2", "travelReverieStateV1"];
  const EDITABLE_KEY = "travelReverieEditableV1";
  const DB_NAME = "travelReverieMedia";
  const DB_STORE = "blobs";

  const typeLabels = {
    "zh-CN": { study: "留学", trip: "旅行", solo: "独自旅行", internship: "实习" },
    "zh-TW": { study: "留學", trip: "旅行", solo: "獨自旅行", internship: "實習" },
    en: { study: "Study abroad", trip: "Journey", solo: "Solo trip", internship: "Internship" },
    es: { study: "Estudios", trip: "Viaje", solo: "Viaje en solitario", internship: "Prácticas" },
    fr: { study: "Études", trip: "Voyage", solo: "Voyage solo", internship: "Stage" },
    el: { study: "Σπουδές", trip: "Ταξίδι", solo: "Μοναχικό ταξίδι", internship: "Πρακτική" },
    de: { study: "Studium", trip: "Reise", solo: "Solo-Reise", internship: "Praktikum" },
    la: { study: "Studium", trip: "Iter", solo: "Iter solitarium", internship: "Tirocinium" },
    ko: { study: "유학", trip: "여행", solo: "혼자 여행", internship: "인턴십" },
    ja: { study: "留学", trip: "旅行", solo: "ひとり旅", internship: "インターン" }
  };
  const i18n = {
    "zh-CN": {
      navJournal:"旅行日志", navMap:"足迹地图", navArchive:"分类归档", addDestination:"添加目的地",
      themeStudio:"主题工作室", paintYourAtlas:"为你的地图调色", backgroundScene:"背景场景", displayFont:"展示字体",
      titleColor:"标题颜色", inkColor:"正文字色", accentColor:"点缀颜色", paperColor:"卡片底色",
      customBackground:"上传自定义背景", backgroundHint:"建议使用横向油画或风景照片（4MB以内）",
      randomize:"随机换景", reset:"恢复默认", exportData:"导出日志 JSON", importData:"导入日志 JSON",
      openJournal:"翻开旅行册", changeScene:"换一幅风景", atlasCaption:"已收藏的城市与岛屿", atlasSub:"每一处足迹，都能继续编辑",
      journalKicker:"pages of places", journalTitle:"旅行日志", journalDescription:"按国家、年份与旅程类型归档。每一张卡片都能改名、改色、写日记，并附上照片或短视频。",
      searchPlaceholder:"搜索城市、国家或日记…", allCountries:"全部国家", allTypes:"全部旅程", typeStudy:"留学", typeTrip:"旅行", typeSolo:"Solo Trip",
      addAnotherPage:"添加新的一页", addAnotherPageHint:"地名、国家、日期、故事、照片、短视频均可编辑",
      mapKicker:"a world that remembers", mapTitle:"足迹地图", mapDescription:"拖动、缩放或切换立体地球；路线从可编辑的故乡起点向外延展。",
      flatMap:"平面地图", globe:"立体地球", fitFootprints:"显示全部足迹", originLabel:"旅程起点", save:"保存", globeLoading:"正在唤醒立体地球…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"分类与归档", archiveDescription:"国家是一册，年份是一枚书签。点击任意标签即可回到对应日志。",
      writeNextJourney:"写下下一段旅程", savedLocally:"内容自动保存在当前浏览器",
      editPage:"编辑旅行页", newDestination:"新的目的地", destinationName:"目的地名称", country:"所属国家", startDate:"开始日期", endDate:"结束日期",
      journeyType:"旅程类型", cardColor:"卡片颜色", latitude:"纬度", longitude:"经度", autoLocate:"根据地名自动定位", coordinateHint:"也可以手动输入坐标",
      journalEntry:"旅行日记", media:"照片或短视频", mediaHint:"媒体将保存在当前浏览器的本地数据库中", deletePage:"删除此页", cancel:"取消", savePage:"保存这一页", edit:"编辑",
      noResults:"没有找到相符的旅行页。", located:"已找到坐标", locateFailed:"未能自动定位，请手动填写坐标。", imported:"导入成功。", importFailed:"文件格式不正确。",
      countryBook:"国家册", yearBookmark:"年份书签", destinations:"个目的地", undated:"待填写日期", emptyStory:"这里还没有文字，点击编辑写下这一段旅程。"
    },
    "zh-TW": {
      navJournal:"旅行日誌", navMap:"足跡地圖", navArchive:"分類歸檔", addDestination:"新增目的地",
      themeStudio:"主題工作室", paintYourAtlas:"為你的地圖調色", backgroundScene:"背景場景", displayFont:"展示字體",
      titleColor:"標題顏色", inkColor:"正文字色", accentColor:"點綴顏色", paperColor:"卡片底色",
      customBackground:"上傳自訂背景", backgroundHint:"建議使用橫向油畫或風景照片（4MB以內）",
      randomize:"隨機換景", reset:"恢復預設", exportData:"匯出日誌 JSON", importData:"匯入日誌 JSON",
      openJournal:"翻開旅行冊", changeScene:"換一幅風景", atlasCaption:"已收藏的城市與島嶼", atlasSub:"每一處足跡，都能繼續編輯",
      journalKicker:"pages of places", journalTitle:"旅行日誌", journalDescription:"依國家、年份與旅程類型歸檔。每張卡片都能改名、改色、寫日記，並附照片或短影片。",
      searchPlaceholder:"搜尋城市、國家或日記…", allCountries:"全部國家", allTypes:"全部旅程", typeStudy:"留學", typeTrip:"旅行", typeSolo:"Solo Trip",
      addAnotherPage:"新增一頁", addAnotherPageHint:"地名、國家、日期、故事、照片、短影片皆可編輯",
      mapKicker:"a world that remembers", mapTitle:"足跡地圖", mapDescription:"拖動、縮放或切換立體地球；路線從可編輯的故鄉起點向外延展。",
      flatMap:"平面地圖", globe:"立體地球", fitFootprints:"顯示全部足跡", originLabel:"旅程起點", save:"儲存", globeLoading:"正在喚醒立體地球…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"分類與歸檔", archiveDescription:"國家是一冊，年份是一枚書籤。點擊任意標籤即可回到對應日誌。",
      writeNextJourney:"寫下下一段旅程", savedLocally:"內容自動儲存在目前瀏覽器",
      editPage:"編輯旅行頁", newDestination:"新的目的地", destinationName:"目的地名稱", country:"所屬國家", startDate:"開始日期", endDate:"結束日期",
      journeyType:"旅程類型", cardColor:"卡片顏色", latitude:"緯度", longitude:"經度", autoLocate:"依地名自動定位", coordinateHint:"也可以手動輸入座標",
      journalEntry:"旅行日記", media:"照片或短影片", mediaHint:"媒體將儲存在目前瀏覽器的本機資料庫", deletePage:"刪除此頁", cancel:"取消", savePage:"儲存此頁", edit:"編輯",
      noResults:"沒有找到相符的旅行頁。", located:"已找到座標", locateFailed:"無法自動定位，請手動填寫座標。", imported:"匯入成功。", importFailed:"檔案格式不正確。",
      countryBook:"國家冊", yearBookmark:"年份書籤", destinations:"個目的地", undated:"待填日期", emptyStory:"這裡還沒有文字，點擊編輯寫下這段旅程。"
    },
    en: {
      navJournal:"Journal", navMap:"Footprint Map", navArchive:"Archive", addDestination:"Add destination",
      themeStudio:"Theme studio", paintYourAtlas:"Paint your atlas", backgroundScene:"Background scene", displayFont:"Display font",
      titleColor:"Title color", inkColor:"Text color", accentColor:"Accent color", paperColor:"Card paper",
      customBackground:"Upload a custom background", backgroundHint:"Landscape paintings or scenery, under 4MB",
      randomize:"Random scene", reset:"Reset", exportData:"Export journal JSON", importData:"Import journal JSON",
      openJournal:"Open the journal", changeScene:"Change the scenery", atlasCaption:"Cities and islands kept", atlasSub:"Every footprint remains editable",
      journalKicker:"pages of places", journalTitle:"Travel Journal", journalDescription:"Archive by country, year and journey type. Rename, recolor, write, and attach photos or short videos.",
      searchPlaceholder:"Search city, country or journal…", allCountries:"All countries", allTypes:"All journeys", typeStudy:"Study abroad", typeTrip:"Journey", typeSolo:"Solo Trip",
      addAnotherPage:"Add another page", addAnotherPageHint:"Place, country, dates, story, photos and videos are editable",
      mapKicker:"a world that remembers", mapTitle:"Footprint Map", mapDescription:"Drag, zoom, or switch to a globe. Routes grow outward from your editable hometown.",
      flatMap:"Flat map", globe:"3D globe", fitFootprints:"Fit all footprints", originLabel:"Journey origin", save:"Save", globeLoading:"Waking the globe…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"Archive", archiveDescription:"Each country becomes a volume; each year becomes a bookmark. Click a label to return to its pages.",
      writeNextJourney:"Write the next journey", savedLocally:"Automatically saved in this browser",
      editPage:"Edit travel page", newDestination:"New destination", destinationName:"Destination", country:"Country", startDate:"Start date", endDate:"End date",
      journeyType:"Journey type", cardColor:"Card color", latitude:"Latitude", longitude:"Longitude", autoLocate:"Locate from place name", coordinateHint:"You can also enter coordinates manually",
      journalEntry:"Journal entry", media:"Photos or short videos", mediaHint:"Media is stored locally in this browser", deletePage:"Delete page", cancel:"Cancel", savePage:"Save page", edit:"Edit",
      noResults:"No matching travel pages.", located:"Coordinates found", locateFailed:"Could not locate it automatically. Enter coordinates manually.", imported:"Import complete.", importFailed:"Invalid file format.",
      countryBook:"Country volume", yearBookmark:"Year bookmark", destinations:"destinations", undated:"Dates to be added", emptyStory:"No words here yet. Edit this page to remember the journey."
    },
    es: {
      navJournal:"Diario", navMap:"Mapa", navArchive:"Archivo", addDestination:"Añadir destino",
      themeStudio:"Estudio de estilo", paintYourAtlas:"Pinta tu atlas", backgroundScene:"Escena de fondo", displayFont:"Tipografía",
      titleColor:"Color del título", inkColor:"Color del texto", accentColor:"Color de acento", paperColor:"Papel de tarjeta",
      customBackground:"Subir fondo personalizado", backgroundHint:"Paisaje u óleo horizontal, menos de 4MB",
      randomize:"Cambiar escena", reset:"Restablecer", exportData:"Exportar JSON", importData:"Importar JSON",
      openJournal:"Abrir el diario", changeScene:"Cambiar paisaje", atlasCaption:"Ciudades e islas guardadas", atlasSub:"Cada huella sigue siendo editable",
      journalKicker:"pages of places", journalTitle:"Diario de viaje", journalDescription:"Archiva por país, año y tipo de viaje. Cambia nombres, colores, textos y añade fotos o vídeos.",
      searchPlaceholder:"Buscar ciudad, país o diario…", allCountries:"Todos los países", allTypes:"Todos los viajes", typeStudy:"Estudios", typeTrip:"Viaje", typeSolo:"Viaje solo",
      addAnotherPage:"Añadir otra página", addAnotherPageHint:"Lugar, país, fechas, historia, fotos y vídeos son editables",
      mapKicker:"a world that remembers", mapTitle:"Mapa de huellas", mapDescription:"Arrastra, amplía o cambia al globo. Las rutas parten de tu ciudad de origen editable.",
      flatMap:"Mapa plano", globe:"Globo 3D", fitFootprints:"Ver todas las huellas", originLabel:"Origen", save:"Guardar", globeLoading:"Despertando el globo…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"Archivo", archiveDescription:"Cada país es un volumen; cada año, un marcapáginas.",
      writeNextJourney:"Escribir el próximo viaje", savedLocally:"Guardado automáticamente en este navegador",
      editPage:"Editar página", newDestination:"Nuevo destino", destinationName:"Destino", country:"País", startDate:"Fecha inicial", endDate:"Fecha final",
      journeyType:"Tipo de viaje", cardColor:"Color de tarjeta", latitude:"Latitud", longitude:"Longitud", autoLocate:"Localizar por nombre", coordinateHint:"También puedes introducir coordenadas",
      journalEntry:"Diario", media:"Fotos o vídeos cortos", mediaHint:"Los archivos se guardan localmente en este navegador", deletePage:"Eliminar página", cancel:"Cancelar", savePage:"Guardar página", edit:"Editar",
      noResults:"No hay páginas coincidentes.", located:"Coordenadas encontradas", locateFailed:"No se pudo localizar automáticamente.", imported:"Importación completada.", importFailed:"Formato no válido.",
      countryBook:"Volumen de país", yearBookmark:"Marcador anual", destinations:"destinos", undated:"Fechas pendientes", emptyStory:"Aún no hay texto. Edita esta página para recordar el viaje."
    },
    fr: {
      navJournal:"Carnet", navMap:"Carte", navArchive:"Archives", addDestination:"Ajouter une destination",
      themeStudio:"Atelier de thème", paintYourAtlas:"Peindre votre atlas", backgroundScene:"Décor", displayFont:"Police",
      titleColor:"Couleur du titre", inkColor:"Couleur du texte", accentColor:"Accent", paperColor:"Papier des cartes",
      customBackground:"Importer un fond", backgroundHint:"Paysage ou peinture horizontale, moins de 4 Mo",
      randomize:"Changer le décor", reset:"Réinitialiser", exportData:"Exporter JSON", importData:"Importer JSON",
      openJournal:"Ouvrir le carnet", changeScene:"Changer de paysage", atlasCaption:"Villes et îles conservées", atlasSub:"Chaque trace reste modifiable",
      journalKicker:"pages of places", journalTitle:"Carnet de voyage", journalDescription:"Classez par pays, année et type de voyage. Renommez, recolorez, écrivez et ajoutez des médias.",
      searchPlaceholder:"Rechercher une ville, un pays ou un texte…", allCountries:"Tous les pays", allTypes:"Tous les voyages", typeStudy:"Études", typeTrip:"Voyage", typeSolo:"Voyage solo",
      addAnotherPage:"Ajouter une page", addAnotherPageHint:"Lieu, pays, dates, récit, photos et vidéos sont modifiables",
      mapKicker:"a world that remembers", mapTitle:"Carte des traces", mapDescription:"Déplacez, zoomez ou passez au globe. Les routes partent de votre ville d'origine modifiable.",
      flatMap:"Carte plane", globe:"Globe 3D", fitFootprints:"Afficher toutes les traces", originLabel:"Point de départ", save:"Enregistrer", globeLoading:"Réveil du globe…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"Archives", archiveDescription:"Chaque pays devient un volume; chaque année un marque-page.",
      writeNextJourney:"Écrire le prochain voyage", savedLocally:"Enregistré automatiquement dans ce navigateur",
      editPage:"Modifier la page", newDestination:"Nouvelle destination", destinationName:"Destination", country:"Pays", startDate:"Début", endDate:"Fin",
      journeyType:"Type de voyage", cardColor:"Couleur de carte", latitude:"Latitude", longitude:"Longitude", autoLocate:"Localiser par le nom", coordinateHint:"Vous pouvez aussi saisir les coordonnées",
      journalEntry:"Journal", media:"Photos ou courtes vidéos", mediaHint:"Les médias sont conservés localement dans ce navigateur", deletePage:"Supprimer", cancel:"Annuler", savePage:"Enregistrer", edit:"Modifier",
      noResults:"Aucune page correspondante.", located:"Coordonnées trouvées", locateFailed:"Localisation automatique impossible.", imported:"Importation terminée.", importFailed:"Format invalide.",
      countryBook:"Volume pays", yearBookmark:"Marque-page annuel", destinations:"destinations", undated:"Dates à compléter", emptyStory:"Aucun texte pour l'instant. Modifiez cette page pour garder le souvenir."
    },
    el: {
      navJournal:"Ημερολόγιο", navMap:"Χάρτης", navArchive:"Αρχείο", addDestination:"Προσθήκη προορισμού",
      themeStudio:"Εργαστήριο θέματος", paintYourAtlas:"Χρωμάτισε τον άτλαντά σου", backgroundScene:"Φόντο", displayFont:"Γραμματοσειρά",
      titleColor:"Χρώμα τίτλου", inkColor:"Χρώμα κειμένου", accentColor:"Χρώμα έμφασης", paperColor:"Χρώμα καρτών",
      customBackground:"Μεταφόρτωση φόντου", backgroundHint:"Οριζόντιος πίνακας ή τοπίο, κάτω από 4MB",
      randomize:"Τυχαίο τοπίο", reset:"Επαναφορά", exportData:"Εξαγωγή JSON", importData:"Εισαγωγή JSON",
      openJournal:"Άνοιξε το ημερολόγιο", changeScene:"Άλλαξε τοπίο", atlasCaption:"Πόλεις και νησιά", atlasSub:"Κάθε ίχνος παραμένει επεξεργάσιμο",
      journalKicker:"pages of places", journalTitle:"Ταξιδιωτικό ημερολόγιο", journalDescription:"Αρχειοθέτηση ανά χώρα, έτος και τύπο ταξιδιού. Πρόσθεσε κείμενο, χρώμα, φωτογραφίες και βίντεο.",
      searchPlaceholder:"Αναζήτηση πόλης, χώρας ή κειμένου…", allCountries:"Όλες οι χώρες", allTypes:"Όλα τα ταξίδια", typeStudy:"Σπουδές", typeTrip:"Ταξίδι", typeSolo:"Μοναχικό ταξίδι",
      addAnotherPage:"Πρόσθεσε νέα σελίδα", addAnotherPageHint:"Τόπος, χώρα, ημερομηνίες, ιστορία και πολυμέσα επεξεργάζονται",
      mapKicker:"a world that remembers", mapTitle:"Χάρτης διαδρομών", mapDescription:"Μετακίνησε, μεγέθυνε ή πέρασε στην υδρόγειο. Οι διαδρομές ξεκινούν από την επεξεργάσιμη αφετηρία.",
      flatMap:"Επίπεδος χάρτης", globe:"Υδρόγειος 3D", fitFootprints:"Όλα τα ίχνη", originLabel:"Αφετηρία", save:"Αποθήκευση", globeLoading:"Ξυπνά η υδρόγειος…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"Αρχείο", archiveDescription:"Κάθε χώρα γίνεται τόμος και κάθε έτος σελιδοδείκτης.",
      writeNextJourney:"Γράψε το επόμενο ταξίδι", savedLocally:"Αυτόματη αποθήκευση σε αυτό το πρόγραμμα περιήγησης",
      editPage:"Επεξεργασία σελίδας", newDestination:"Νέος προορισμός", destinationName:"Προορισμός", country:"Χώρα", startDate:"Έναρξη", endDate:"Λήξη",
      journeyType:"Τύπος ταξιδιού", cardColor:"Χρώμα κάρτας", latitude:"Γεωγραφικό πλάτος", longitude:"Γεωγραφικό μήκος", autoLocate:"Αυτόματος εντοπισμός", coordinateHint:"Ή εισάγετε συντεταγμένες",
      journalEntry:"Ημερολόγιο", media:"Φωτογραφίες ή σύντομα βίντεο", mediaHint:"Τα αρχεία αποθηκεύονται τοπικά", deletePage:"Διαγραφή", cancel:"Ακύρωση", savePage:"Αποθήκευση", edit:"Επεξεργασία",
      noResults:"Δεν βρέθηκαν σελίδες.", located:"Βρέθηκαν συντεταγμένες", locateFailed:"Αποτυχία αυτόματου εντοπισμού.", imported:"Η εισαγωγή ολοκληρώθηκε.", importFailed:"Μη έγκυρη μορφή.",
      countryBook:"Τόμος χώρας", yearBookmark:"Σελιδοδείκτης έτους", destinations:"προορισμοί", undated:"Χωρίς ημερομηνίες", emptyStory:"Δεν υπάρχει ακόμη κείμενο. Επεξεργαστείτε τη σελίδα."
    },
    de: {
      navJournal:"Reisetagebuch", navMap:"Karte", navArchive:"Archiv", addDestination:"Ziel hinzufügen",
      themeStudio:"Themenatelier", paintYourAtlas:"Gestalte deinen Atlas", backgroundScene:"Hintergrund", displayFont:"Schriftart",
      titleColor:"Titelfarbe", inkColor:"Textfarbe", accentColor:"Akzentfarbe", paperColor:"Kartenpapier",
      customBackground:"Eigenen Hintergrund laden", backgroundHint:"Querformatiges Gemälde oder Landschaft, unter 4 MB",
      randomize:"Szene wechseln", reset:"Zurücksetzen", exportData:"JSON exportieren", importData:"JSON importieren",
      openJournal:"Tagebuch öffnen", changeScene:"Landschaft wechseln", atlasCaption:"Gesammelte Städte und Inseln", atlasSub:"Jede Spur bleibt bearbeitbar",
      journalKicker:"pages of places", journalTitle:"Reisetagebuch", journalDescription:"Nach Land, Jahr und Reiseart ordnen. Namen, Farben, Texte, Fotos und Videos bearbeiten.",
      searchPlaceholder:"Stadt, Land oder Text suchen…", allCountries:"Alle Länder", allTypes:"Alle Reisen", typeStudy:"Studium", typeTrip:"Reise", typeSolo:"Solo-Reise",
      addAnotherPage:"Neue Seite hinzufügen", addAnotherPageHint:"Ort, Land, Daten, Geschichte und Medien sind bearbeitbar",
      mapKicker:"a world that remembers", mapTitle:"Spurenkarte", mapDescription:"Verschieben, zoomen oder zum Globus wechseln. Routen beginnen am bearbeitbaren Heimatort.",
      flatMap:"Flache Karte", globe:"3D-Globus", fitFootprints:"Alle Spuren zeigen", originLabel:"Ausgangspunkt", save:"Speichern", globeLoading:"Der Globus erwacht…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"Archiv", archiveDescription:"Jedes Land wird ein Band, jedes Jahr ein Lesezeichen.",
      writeNextJourney:"Nächste Reise schreiben", savedLocally:"Automatisch in diesem Browser gespeichert",
      editPage:"Reiseseite bearbeiten", newDestination:"Neues Ziel", destinationName:"Reiseziel", country:"Land", startDate:"Beginn", endDate:"Ende",
      journeyType:"Reiseart", cardColor:"Kartenfarbe", latitude:"Breitengrad", longitude:"Längengrad", autoLocate:"Nach Ortsname suchen", coordinateHint:"Koordinaten können auch manuell eingegeben werden",
      journalEntry:"Tagebuchtext", media:"Fotos oder kurze Videos", mediaHint:"Medien werden lokal in diesem Browser gespeichert", deletePage:"Seite löschen", cancel:"Abbrechen", savePage:"Seite speichern", edit:"Bearbeiten",
      noResults:"Keine passenden Seiten.", located:"Koordinaten gefunden", locateFailed:"Automatische Ortung fehlgeschlagen.", imported:"Import abgeschlossen.", importFailed:"Ungültiges Format.",
      countryBook:"Länderband", yearBookmark:"Jahreslesezeichen", destinations:"Ziele", undated:"Datum offen", emptyStory:"Noch kein Text. Bearbeite diese Seite und halte die Reise fest."
    },
    la: {
      navJournal:"Diarium", navMap:"Mappa", navArchive:"Archivum", addDestination:"Locum adde",
      themeStudio:"Officina colorum", paintYourAtlas:"Atlas tuus pingatur", backgroundScene:"Scaena", displayFont:"Litterae",
      titleColor:"Color tituli", inkColor:"Color textus", accentColor:"Color ornamentorum", paperColor:"Color chartae",
      customBackground:"Imaginem propriam pone", backgroundHint:"Pictura lata, minor quam 4MB",
      randomize:"Scaenam muta", reset:"Restitue", exportData:"JSON exporta", importData:"JSON importa",
      openJournal:"Diarium aperi", changeScene:"Scaenam muta", atlasCaption:"Urbes insulaeque servatae", atlasSub:"Omne vestigium mutari potest",
      journalKicker:"pages of places", journalTitle:"Diarium itinerum", journalDescription:"Per nationem, annum et genus itineris ordina; verba, colores et imagines adde.",
      searchPlaceholder:"Urbem, nationem vel verba quaere…", allCountries:"Omnes nationes", allTypes:"Omnia itinera", typeStudy:"Studium", typeTrip:"Iter", typeSolo:"Iter solitarium",
      addAnotherPage:"Novam paginam adde", addAnotherPageHint:"Locus, natio, dies, narratio et media mutari possunt",
      mapKicker:"a world that remembers", mapTitle:"Mappa vestigiorum", mapDescription:"Trahe, amplia vel globum elige; viae ab origine mutabili exeunt.",
      flatMap:"Mappa plana", globe:"Globus 3D", fitFootprints:"Omnia vestigia", originLabel:"Origo itineris", save:"Serva", globeLoading:"Globus expergiscitur…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"Archivum", archiveDescription:"Quaeque natio volumen, quisque annus signum paginae fit.",
      writeNextJourney:"Proximum iter scribe", savedLocally:"In hoc navigatro automatice servatur",
      editPage:"Paginam muta", newDestination:"Novus locus", destinationName:"Locus", country:"Natio", startDate:"Initium", endDate:"Finis",
      journeyType:"Genus itineris", cardColor:"Color chartae", latitude:"Latitudo", longitude:"Longitudo", autoLocate:"Locum nomine reperi", coordinateHint:"Vel coordinata manu insere",
      journalEntry:"Narratio", media:"Imagines vel brevia video", mediaHint:"Media in hoc navigatro servantur", deletePage:"Paginam dele", cancel:"Intermitte", savePage:"Paginam serva", edit:"Muta",
      noResults:"Nullae paginae inventae.", located:"Coordinata inventa", locateFailed:"Locus automatice non inventus.", imported:"Importatio perfecta.", importFailed:"Forma non valida.",
      countryBook:"Volumen nationis", yearBookmark:"Signum anni", destinations:"loca", undated:"Dies nondum scripti", emptyStory:"Verba nondum adsunt. Hanc paginam muta."
    },
    ko: {
      navJournal:"여행 일기", navMap:"발자국 지도", navArchive:"분류 보관", addDestination:"여행지 추가",
      themeStudio:"테마 스튜디오", paintYourAtlas:"나만의 지도를 칠하기", backgroundScene:"배경 장면", displayFont:"제목 글꼴",
      titleColor:"제목 색", inkColor:"본문 색", accentColor:"포인트 색", paperColor:"카드 색",
      customBackground:"사용자 배경 업로드", backgroundHint:"가로형 그림 또는 풍경, 4MB 이하",
      randomize:"무작위 장면", reset:"초기화", exportData:"JSON 내보내기", importData:"JSON 가져오기",
      openJournal:"여행책 열기", changeScene:"풍경 바꾸기", atlasCaption:"기억한 도시와 섬", atlasSub:"모든 발자국을 계속 편집할 수 있어요",
      journalKicker:"pages of places", journalTitle:"여행 일기", journalDescription:"국가, 연도, 여행 유형으로 정리하고 이름·색·글·사진·짧은 영상을 편집하세요.",
      searchPlaceholder:"도시, 국가 또는 일기 검색…", allCountries:"모든 국가", allTypes:"모든 여행", typeStudy:"유학", typeTrip:"여행", typeSolo:"혼자 여행",
      addAnotherPage:"새 페이지 추가", addAnotherPageHint:"장소, 국가, 날짜, 이야기, 사진, 영상을 편집할 수 있어요",
      mapKicker:"a world that remembers", mapTitle:"발자국 지도", mapDescription:"이동하고 확대하거나 3D 지구본으로 전환하세요. 편집 가능한 고향에서 경로가 시작됩니다.",
      flatMap:"평면 지도", globe:"3D 지구본", fitFootprints:"모든 발자국 보기", originLabel:"여행 출발지", save:"저장", globeLoading:"지구본을 깨우는 중…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"분류 보관", archiveDescription:"국가는 한 권의 책, 연도는 책갈피가 됩니다.",
      writeNextJourney:"다음 여행 쓰기", savedLocally:"현재 브라우저에 자동 저장됩니다",
      editPage:"여행 페이지 편집", newDestination:"새 여행지", destinationName:"여행지", country:"국가", startDate:"시작일", endDate:"종료일",
      journeyType:"여행 유형", cardColor:"카드 색", latitude:"위도", longitude:"경도", autoLocate:"장소명으로 자동 찾기", coordinateHint:"좌표를 직접 입력할 수도 있어요",
      journalEntry:"여행 일기", media:"사진 또는 짧은 영상", mediaHint:"미디어는 현재 브라우저에 로컬 저장됩니다", deletePage:"페이지 삭제", cancel:"취소", savePage:"페이지 저장", edit:"편집",
      noResults:"일치하는 여행 페이지가 없습니다.", located:"좌표를 찾았습니다", locateFailed:"자동 위치 찾기에 실패했습니다.", imported:"가져오기가 완료되었습니다.", importFailed:"잘못된 파일 형식입니다.",
      countryBook:"국가별 책", yearBookmark:"연도 책갈피", destinations:"개 여행지", undated:"날짜 미정", emptyStory:"아직 글이 없습니다. 편집을 눌러 여행을 기록하세요."
    },
    ja: {
      navJournal:"旅の日記", navMap:"足跡マップ", navArchive:"分類・保存", addDestination:"目的地を追加",
      themeStudio:"テーマ工房", paintYourAtlas:"自分の地図を彩る", backgroundScene:"背景シーン", displayFont:"見出しフォント",
      titleColor:"タイトル色", inkColor:"本文色", accentColor:"アクセント色", paperColor:"カード色",
      customBackground:"背景画像をアップロード", backgroundHint:"横長の絵画や風景（4MB以下）",
      randomize:"景色を変える", reset:"リセット", exportData:"JSONを書き出す", importData:"JSONを読み込む",
      openJournal:"旅の冊子を開く", changeScene:"景色を変える", atlasCaption:"集めた都市と島", atlasSub:"すべての足跡をあとから編集できます",
      journalKicker:"pages of places", journalTitle:"旅の日記", journalDescription:"国・年・旅の種類で整理。名前、色、文章、写真、短い動画を自由に編集できます。",
      searchPlaceholder:"都市・国・日記を検索…", allCountries:"すべての国", allTypes:"すべての旅", typeStudy:"留学", typeTrip:"旅行", typeSolo:"ひとり旅",
      addAnotherPage:"新しいページを追加", addAnotherPageHint:"地名、国、日付、物語、写真、動画を編集できます",
      mapKicker:"a world that remembers", mapTitle:"足跡マップ", mapDescription:"ドラッグ、ズーム、3D地球儀への切り替えが可能。編集できる故郷からルートが広がります。",
      flatMap:"平面地図", globe:"3D地球儀", fitFootprints:"すべて表示", originLabel:"旅の出発地", save:"保存", globeLoading:"地球儀を起こしています…",
      archiveKicker:"sorted like pressed flowers", archiveTitle:"分類・保存", archiveDescription:"国は一冊の本に、年はしおりになります。",
      writeNextJourney:"次の旅を書く", savedLocally:"このブラウザに自動保存されます",
      editPage:"旅行ページを編集", newDestination:"新しい目的地", destinationName:"目的地", country:"国", startDate:"開始日", endDate:"終了日",
      journeyType:"旅の種類", cardColor:"カード色", latitude:"緯度", longitude:"経度", autoLocate:"地名から自動検索", coordinateHint:"座標を手入力することもできます",
      journalEntry:"旅の日記", media:"写真または短い動画", mediaHint:"メディアはこのブラウザ内に保存されます", deletePage:"ページを削除", cancel:"キャンセル", savePage:"ページを保存", edit:"編集",
      noResults:"一致する旅行ページがありません。", located:"座標が見つかりました", locateFailed:"自動検索できませんでした。", imported:"読み込みが完了しました。", importFailed:"ファイル形式が正しくありません。",
      countryBook:"国別の冊子", yearBookmark:"年のしおり", destinations:"か所", undated:"日付未入力", emptyStory:"まだ文章がありません。編集して旅を残しましょう。"
    }
  };

  const extraI18n = {
    "zh-CN": {
      themeStudio:"主题工作室", paintYourAtlas:"为你的地图调色", backgroundScene:"背景场景", displayFont:"展示字体", titleColor:"标题颜色", inkColor:"正文字色", accentColor:"点缀颜色", paperColor:"卡片底色", customBackground:"上传自定义背景", backgroundHint:"建议使用横向油画或风景照片（4MB以内）", randomize:"随机换景", reset:"恢复默认", originLabel:"旅程起点", fitFootprints:"显示全部足迹", globeLoading:"正在唤醒立体地球…", coordinateHint:"也可以手动输入坐标", located:"已定位", locateFailed:"定位失败，请手动输入", imported:"导入成功", importFailed:"导入失败，请检查 JSON 文件", undated:"未标注日期", countryBook:"国家分册", yearBookmark:"年份书签", destinations:"个目的地", emptyStory:"这一页还没有写下故事。", backgroundUpload:"上传自定义背景", typeInternship:"实习", currentStatus:"当前 · 马德里实习", currentBadge:"CURRENT · 实习中", routeSteps:"途经顺序", mapLoading:"正在铺开地图颜料…", mapUnavailable:"地图暂时无法载入，请检查网络后重试。", unrouted:"尚未加入足迹路线", coverImage:"封面图片链接", coverImageHint:"有链接时优先作为卡片封面；留空则使用本地媒体或渐变背景。", expandRoutes:"展开全部路线", collapseRoutes:"收起路线", recentRoutes:"最近路线", fitDone:"已显示全部足迹", globeReady:"立体地球已就绪", globeLightweight:"已启用轻量地球底图", memoryStyle:"记忆风格"
    },
    en: {
      themeStudio:"Theme Studio", paintYourAtlas:"Paint Your Atlas", backgroundScene:"Background Scene", displayFont:"Display Font", titleColor:"Title Color", inkColor:"Text Color", accentColor:"Accent Color", paperColor:"Paper Color", customBackground:"Upload Custom Background", backgroundHint:"A landscape or painting image within 4MB works best.", randomize:"Randomize", reset:"Reset", originLabel:"Journey origin", fitFootprints:"Show all footsteps", globeLoading:"Waking the globe…", coordinateHint:"You can also type the coordinates manually.", located:"Located", locateFailed:"Location failed, please enter coordinates manually.", imported:"Imported successfully", importFailed:"Import failed, please check the JSON file.", undated:"Undated", countryBook:"Country album", yearBookmark:"Year bookmark", destinations:"destinations", emptyStory:"This page is still waiting for its story.", typeInternship:"Internship", currentStatus:"Current · Internship in Madrid", currentBadge:"CURRENT · INTERNSHIP", routeSteps:"Route steps", mapLoading:"Painting the map…", mapUnavailable:"The map could not load. Please check the connection and retry.", unrouted:"Not yet included in a route", coverImage:"Cover image URL", coverImageHint:"The URL is used first; leave it blank to use local media or a gradient.", expandRoutes:"Expand all routes", collapseRoutes:"Collapse routes", recentRoutes:"Recent routes", fitDone:"All footprints are now in view", globeReady:"The globe is ready", globeLightweight:"Using the lightweight globe surface", memoryStyle:"Memory Style"
    },
    "zh-TW": { typeInternship:"實習", currentStatus:"目前 · 馬德里實習", currentBadge:"CURRENT · 實習中", routeSteps:"途經順序", mapLoading:"正在鋪開地圖顏料…", mapUnavailable:"地圖暫時無法載入，請檢查網路後重試。", unrouted:"尚未加入足跡路線" },
    es: { typeInternship:"Prácticas", currentStatus:"Actual · Prácticas en Madrid", currentBadge:"ACTUAL · PRÁCTICAS", routeSteps:"Pasos de la ruta", mapLoading:"Pintando el mapa…", mapUnavailable:"No se pudo cargar el mapa. Comprueba la conexión.", unrouted:"Aún no está incluido en una ruta" },
    fr: { typeInternship:"Stage", currentStatus:"Actuel · Stage à Madrid", currentBadge:"ACTUEL · STAGE", routeSteps:"Étapes du trajet", mapLoading:"Peinture de la carte…", mapUnavailable:"La carte ne peut pas être chargée. Vérifiez la connexion.", unrouted:"Pas encore inclus dans un itinéraire" },
    el: { typeInternship:"Πρακτική", currentStatus:"Τώρα · Πρακτική στη Μαδρίτη", currentBadge:"ΤΩΡΑ · ΠΡΑΚΤΙΚΗ", routeSteps:"Στάδια διαδρομής", mapLoading:"Ζωγραφίζεται ο χάρτης…", mapUnavailable:"Ο χάρτης δεν φορτώθηκε. Ελέγξτε τη σύνδεση.", unrouted:"Δεν έχει προστεθεί ακόμη σε διαδρομή" },
    de: { typeInternship:"Praktikum", currentStatus:"Aktuell · Praktikum in Madrid", currentBadge:"AKTUELL · PRAKTIKUM", routeSteps:"Routenstationen", mapLoading:"Die Karte wird gemalt…", mapUnavailable:"Die Karte konnte nicht geladen werden. Bitte Verbindung prüfen.", unrouted:"Noch keiner Route hinzugefügt" },
    la: { typeInternship:"Tirocinium", currentStatus:"Nunc · Tirocinium Matriti", currentBadge:"NUNC · TIROCINIUM", routeSteps:"Gradus itineris", mapLoading:"Mappa pingitur…", mapUnavailable:"Mappa onerari non potuit. Conexionem inspice.", unrouted:"Itineri nondum additum" },
    ko: { typeInternship:"인턴십", currentStatus:"현재 · 마드리드 인턴십", currentBadge:"CURRENT · 인턴십", routeSteps:"경로 순서", mapLoading:"지도를 그리고 있어요…", mapUnavailable:"지도를 불러오지 못했습니다. 연결을 확인하세요.", unrouted:"아직 경로에 포함되지 않음" },
    ja: { typeInternship:"インターン", currentStatus:"現在 · マドリードでインターン", currentBadge:"CURRENT · インターン", routeSteps:"経路の順番", mapLoading:"地図を描いています…", mapUnavailable:"地図を読み込めませんでした。接続を確認してください。", unrouted:"まだ経路に追加されていません" }
  };
  Object.keys(extraI18n).forEach(lang => {
    i18n[lang] = { ...(i18n[lang] || {}), ...extraI18n[lang] };
  });
  const commonI18nFallback = {
    typeInternship: "Internship",
    currentStatus: "Current · Internship in Madrid",
    currentBadge: "CURRENT · INTERNSHIP",
    routeSteps: "Route steps",
    mapLoading: "Painting the map…",
    mapUnavailable: "The map could not load. Please check the connection and retry.",
    unrouted: "Not yet included in a route",
    coverImage: "Cover image URL",
    coverImageHint: "The URL is used first; leave it blank to use local media or a gradient.",
    expandRoutes: "Expand all routes",
    collapseRoutes: "Collapse routes",
    recentRoutes: "Recent routes",
    fitDone: "All footprints are now in view",
    globeReady: "The globe is ready",
    globeLightweight: "Using the lightweight globe surface",
    memoryStyle: "Memory Style"
  };
  Object.keys(i18n).forEach(lang => {
    i18n[lang] = { ...commonI18nFallback, ...i18n[lang] };
  });

  const MODERN_FONT = "'Noto Sans SC', 'Inter', sans-serif";
  const MEMORY_STYLE_IDS = Object.freeze(["oil", "y2k", "film", "sketchbook", "watercolor"]);
  const MEMORY_STYLE_CONFIG = Object.freeze({
    oil: {
      body:"'Noto Sans SC', 'Inter', sans-serif",
      display:null,
      interface:"'Cormorant Garamond', 'Noto Serif SC', serif",
      themeColor:"#151a22",
      route:["#b08aa2", "#7b99a3", "#b8ab81", "#8ca694", "#a28fb5"],
      point:["#f7e7be", "#e7c0b2", "#a88aa5"],
      globe:["#6f8793", "#18242b", .24]
    },
    y2k: {
      body:"'Noto Sans SC', 'Inter', sans-serif",
      display:"'Fredoka', 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif",
      interface:"'Silkscreen', 'Noto Sans SC', monospace",
      themeColor:"#d9f6ff",
      route:["#ff77b7", "#69c9ff", "#a98cff", "#7ad7b5", "#ffbd59"],
      point:["#fff06a", "#ff65aa", "#67d3ff"],
      globe:["#8fb7cd", "#292d58", .28]
    },
    film: {
      body:"'Noto Serif SC', 'Cardo', serif",
      display:"'Playfair Display', 'Noto Serif SC', serif",
      interface:"'Space Mono', 'Noto Sans SC', monospace",
      themeColor:"#261f19",
      route:["#b76a43", "#77745f", "#8d644f", "#a9966f", "#725c50"],
      point:["#e8c58e", "#cf704c", "#d5ad72"],
      globe:["#7d6957", "#271b16", .30]
    },
    sketchbook: {
      body:"'Noto Sans SC', 'Inter', sans-serif",
      display:"'Patrick Hand', 'Ma Shan Zheng', 'Noto Sans SC', cursive",
      interface:"'Caveat', 'Ma Shan Zheng', cursive",
      themeColor:"#eee7d6",
      route:["#314c64", "#a85347", "#718158", "#9b7244", "#685878"],
      point:["#f1d36b", "#d86454", "#496d88"],
      globe:["#80919a", "#293840", .18]
    },
    watercolor: {
      body:"'Noto Serif SC', 'Cardo', serif",
      display:"'Ma Shan Zheng', 'Noto Serif SC', cursive",
      interface:"'Caveat', 'Ma Shan Zheng', cursive",
      themeColor:"#e8f2ee",
      route:["#6fa4a5", "#a98dab", "#8c9fc3", "#bf8d83", "#809d86"],
      point:["#f3dfb4", "#bf8191", "#75a7ad"],
      globe:["#86a6aa", "#284044", .14]
    }
  });
  const ROUTE_PREVIEW_COUNT = 3;
  const ROUTE_STOP_PREVIEW_COUNT = 5;

  const MEMORY_THEME_CAPABILITIES = Object.freeze({
    oil: Object.freeze({
      titleColor:true, inkColor:true, accentColor:true, paperColor:true
    }),
    y2k: Object.freeze({
      titleColor:true, inkColor:true, accentColor:true, paperColor:true
    }),
    film: Object.freeze({
      titleColor:true, inkColor:true, accentColor:true, paperColor:false
    }),
    sketchbook: Object.freeze({
      titleColor:true, inkColor:true, accentColor:true, paperColor:true
    }),
    watercolor: Object.freeze({
      titleColor:true, inkColor:true, accentColor:true, paperColor:true
    })
  });


  const HANDWRITTEN_FONT_STACKS = Object.freeze({
    "Caveat": "'Caveat', 'Ma Shan Zheng', 'Noto Sans SC', cursive",
    "Indie Flower": "'Indie Flower', 'Ma Shan Zheng', 'Noto Sans SC', cursive",
    "Patrick Hand": "'Patrick Hand', 'Ma Shan Zheng', 'Noto Sans SC', cursive",
    "Nanum Pen Script": "'Nanum Pen Script', 'Ma Shan Zheng', 'Noto Sans SC', cursive",
    "Reenie Beanie": "'Reenie Beanie', 'Ma Shan Zheng', 'Noto Sans SC', cursive",
    "Homemade Apple": "'Homemade Apple', 'Ma Shan Zheng', 'Noto Sans SC', cursive"
  });

  function normalizeFontChoice(fontValue) {
    const value = String(fontValue || "").trim();
    if (!value) return MODERN_FONT;

    for (const [family, stack] of Object.entries(HANDWRITTEN_FONT_STACKS)) {
      if (value.includes(`'${family}'`) || value.includes(`"${family}"`)) return stack;
    }

    if (value.includes("'Ma Shan Zheng'")) {
      return value
        .replace(/,\s*'Noto Serif SC'/g, ", 'Noto Sans SC'")
        .replace(/,\s*serif\s*$/i, ", cursive");
    }

    return value;
  }

  function isHandwrittenFont(fontValue) {
    const value = String(fontValue || "");
    return [
      "Caveat",
      "Indie Flower",
      "Patrick Hand",
      "Nanum Pen Script",
      "Reenie Beanie",
      "Homemade Apple",
      "Ma Shan Zheng",
      "Great Vibes",
      "Petit Formal Script",
      "Yesteryear",
      "Sacramento",
      "Shalimar"
    ].some(family => value.includes(family));
  }

  function requestSelectedFonts(fontValue) {
    if (!document.fonts?.load) return;
    const families = [...String(fontValue || "").matchAll(/'([^']+)'/g)].map(match => match[1]);
    families.slice(0, 3).forEach(family => {
      document.fonts.load(`400 1em "${family}"`).catch(() => {});
    });
  }
  const doodles = ["star","cat","heart","flower","sun","wing"];
  function currentMemoryConfig() {
    return MEMORY_STYLE_CONFIG[state?.memoryStyle] || MEMORY_STYLE_CONFIG.oil;
  }

  function routeColor(index) {
    const palette = currentMemoryConfig().route;
    return palette[index % palette.length];
  }

  function memoryPointColor(data) {
    const colors = currentMemoryConfig().point;
    if (data.origin) return colors[0];
    if (data.current) return colors[1];
    return colors[2];
  }

  const seedDestinations = [
    { id:"madrid", aliases:["madrid","马德里"], name:"Madrid · 马德里", country:"Spain · 西班牙", start:"", end:"", type:"internship", status:"current", color:"#cdb8bb", lat:40.4168, lng:-3.7038, story:"第一次飞抵西班牙时，我在马德里落地，再前往格拉纳达开始留学。如今，我已经从格拉纳达来到马德里实习，这座城市也从旅程的入口，变成了新的生活章节。", media:[] },
    { id:"granada", aliases:["granada","格拉纳达","格拉納達"], name:"Granada · 格拉纳达", country:"Spain · 西班牙", start:"", end:"", type:"study", color:"#c9b5a9", lat:37.1773, lng:-3.5986, story:"第一次出国留学的落脚处。阿尔罕布拉宫的砖红、阿尔拜辛的白墙与黄昏里渐暗的雪山，成为旅行册的第一页。完成这一阶段后，我从格拉纳达前往马德里开始实习。", media:[] },
    { id:"malaga", aliases:["malaga","málaga","马拉加","馬拉加"], name:"Málaga · 马拉加", country:"Spain · 西班牙", start:"", end:"", type:"trip", color:"#d0c0a8", lat:36.7213, lng:-4.4214, story:"从格拉纳达前往机场和海边的一处过渡站，像一枚为长途旅行准备的呼吸。", media:[] },
    { id:"vienna", aliases:["vienna","维也纳","維也納"], name:"Vienna · 维也纳", country:"Austria · 奥地利", start:"", end:"", type:"trip", color:"#b8b7c1", lat:48.2082, lng:16.3738, story:"寒假里的维也纳像一页被金箔与乐声压平的旧纸。咖啡馆、环城大道和冬夜的灯，在冷空气里格外清晰。", media:[] },
    { id:"budapest", aliases:["budapest","布达佩斯","布達佩斯"], name:"Budapest · 布达佩斯", country:"Hungary · 匈牙利", start:"", end:"", type:"trip", color:"#9eaeb2", lat:47.4979, lng:19.0402, story:"多瑙河把两岸的光揉成一条缓慢流动的绸带。桥、城堡与夜色一起倒映在水里。", media:[] },
    { id:"rome", aliases:["rome","roma","罗马","羅馬"], name:"Rome · 罗马", country:"Italy · 意大利", start:"", end:"", type:"trip", color:"#c7ad98", lat:41.9028, lng:12.4964, story:"在罗马，时间不是直线，而是从石阶、喷泉与拱门之间反复折返。", media:[] },
    { id:"naples", aliases:["naples","napoli","那不勒斯"], name:"Naples · 那不勒斯", country:"Italy · 意大利", start:"", end:"", type:"trip", color:"#b39e91", lat:40.8518, lng:14.2681, story:"海风、火山、晾晒的衣物与狭窄街巷，让那不勒斯显得热烈又粗粝。", media:[] },
    { id:"seville", aliases:["seville","sevilla","塞维利亚","塞維利亞"], name:"Seville · 塞维利亚", country:"Spain · 西班牙", start:"", end:"", type:"solo", color:"#c79c8f", lat:37.3891, lng:-5.9845, story:"一次独自出发。橘树、瓷砖与午后的光，让城市像一首慢慢升温的弗拉门戈。", media:[] },
    { id:"barcelona", aliases:["barcelona","巴塞罗那","巴塞羅那"], name:"Barcelona · 巴塞罗那", country:"Spain · 西班牙", start:"", end:"", type:"solo", color:"#9baeb0", lat:41.3874, lng:2.1686, story:"沿海风与曲线建筑行走，城市的秩序不断被色彩、马赛克与想象打破。", media:[] },
    { id:"tossa", aliases:["tossa","tossa de mar","托萨德马尔","托薩德馬爾"], name:"Tossa del Mar · 托萨德马尔", country:"Spain · 西班牙", start:"", end:"", type:"trip", color:"#b6c6c7", lat:41.7200, lng:2.9320, story:"从巴塞罗那前往的海边小镇。海墙、岩岸与淡蓝色水面，像手帐边缘落下的一小片薄颜料。", media:[] },
    { id:"paris", aliases:["paris","巴黎"], name:"Paris · 巴黎", country:"France · 法国", start:"", end:"", type:"trip", color:"#b6adb6", lat:48.8566, lng:2.3522, story:"巴黎的记忆更像雨后的油画：灰蓝的天空、暖黄的橱窗，以及塞纳河上被拉长的光。", media:[] },
    { id:"zakynthos", aliases:["zakynthos","zante","扎金索斯"], name:"Zakynthos · 扎金索斯", country:"Greece · 希腊", start:"", end:"", type:"trip", color:"#9bb7b8", lat:37.7870, lng:20.8999, story:"海水从浅绿推向深蓝，岛屿像一块漂在光里的颜料。", media:[] },
    { id:"athens", aliases:["athens","雅典"], name:"Athens · 雅典", country:"Greece · 希腊", start:"", end:"", type:"trip", color:"#c4bca9", lat:37.9838, lng:23.7275, story:"白色城市在山坡间展开，古老石柱与当代街道叠在同一束强烈日光里。", media:[] },
    { id:"aegina", aliases:["aegina","开心果岛","開心果島"], name:"Aegina · 开心果岛", country:"Greece · 希腊", start:"", end:"", type:"trip", color:"#aeb9a6", lat:37.7462, lng:23.4275, story:"从雅典乘船抵达的小岛。开心果树、港口与缓慢的午后，让旅程暂时安静下来。", media:[] }
  ];

  // Kept solely as the V6-to-V7 migration source.  V7 route trips store their
  // own stop snapshots and never resolve them through travel journal entries.
  const legacyDefaultRouteStages = [
    { id:"phase-1", title:"留学启程", note:"从济南出发，先在马德里落地，再前往格拉纳达开始留学生活。", stopIds:["origin","madrid","granada"] },
    { id:"phase-2", title:"寒假中欧与意大利", note:"格拉纳达 → 马拉加机场 → 维也纳 → 布达佩斯 → 罗马 → 那不勒斯 → 罗马 → 格拉纳达", stopIds:["granada","malaga","vienna","budapest","rome","naples","rome","granada"] },
    { id:"phase-3", title:"四月安达卢西亚与海边", note:"格拉纳达 → 塞维利亚 → 巴塞罗那 → Tossa del Mar → 格拉纳达", stopIds:["granada","seville","barcelona","tossa","granada"] },
    { id:"phase-4", title:"暑假希腊群岛", note:"格拉纳达 → 马拉加 → 巴黎 → 扎金索斯 → 雅典 → 开心果岛 → 雅典 → 格拉纳达", stopIds:["granada","malaga","paris","zakynthos","athens","aegina","athens","granada"] },
    { id:"phase-5", title:"当前 · 马德里实习", note:"最新行程：结束格拉纳达阶段后，从格拉纳达来到马德里实习。", stopIds:["granada","madrid"], current:true }
  ];

  const defaultState = {
    schemaVersion: 7,
    language: "zh-CN",
    memoryStyle: "oil",
    scene: ["water","moon","rose","gold","ocean","violet"][Math.floor(Math.random()*6)],
    font: MODERN_FONT,
    titleColor: "#f2ede2",
    inkColor: "#2e2a2a",
    accentColor: "#a88aa5",
    paperColor: "#e8e0d4",
    customBackground: "",
    origin: { name: "济南 · Jinan", lat: 36.6512, lng: 117.1201 },
    journalEntries: structuredClone(seedDestinations),
    routeTrips: createDefaultRouteTrips(seedDestinations, { name:"济南 · Jinan", lat:36.6512, lng:117.1201 }),
    musicTracks: []
  };

  let state = loadState();
  let map, routeLayer, markerLayer, cityLayer, globe, currentMapMode = "2d";
  let mediaUrls = [];
  let dbPromise;
  let painting;
  let resizeObserver;
  let mapIntersectionObserver;
  let globeVisibilityObserver;
  let globeInitPromise;
  let globeResumeTimer;
  let tileLayer;
  let tileFallbackUsed = false;
  let tileErrorCount = 0;
  let mapLoaderTimer;
  let mapHasFittedOnce = false;
  let lastMapSignature = "";
  let lastGlobeSignature = "";
  let pageVisible = !document.hidden;
  let playerState = { currentIndex: -1, objectUrls: [] };
  let activeCountry = "";
  let currentMapDestinationId = "";
  let revealObserver;
  let mediaVisibilityObserver;
  let routeExpanded = false;
  const expandedRouteTripIds = new Set();
  let routeEditorDraft = null;
  let activeRouteStopId = "";
  let routeGeocodeCandidates = [];
  let mapStabilizeFrame = 0;
  let mapStabilizeTimer = 0;
  let firstTileReady = false;
  let mapModeRequestId = 0;
  let memoryTransitionTimer = 0;
  let refreshEditorialDoodles = () => {};

  function normalizeLookup(value = "") {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[·•｜|,，.。'’\-_/()（）]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findCanonicalSeed(destination) {
    const haystack = normalizeLookup(`${destination?.id || ""} ${destination?.name || ""}`);
    return seedDestinations.find(seed => {
      if (destination?.id === seed.id) return true;
      return (seed.aliases || []).some(alias => haystack.includes(normalizeLookup(alias)));
    }) || null;
  }

  function migrateJournalEntries(savedEntries = []) {
    return savedEntries.map((item, index) => {
      const seed = findCanonicalSeed(item);
      const id = seed?.id || item?.id || `journal-${index + 1}-${crypto.randomUUID()}`;
      const merged = { ...(seed ? structuredClone(seed) : {}), ...(item || {}), id };
      merged.media = Array.isArray(item?.media) ? item.media : [];
      if (!Number.isFinite(Number(merged.lat))) merged.lat = seed?.lat ?? null;
      if (!Number.isFinite(Number(merged.lng))) merged.lng = seed?.lng ?? null;
      return merged;
    });
  }

  function routePlaceKey(stop = {}) {
    const lat = Number(stop.lat);
    const lng = Number(stop.lng);
    return `${normalizeLookup(stop.name || stop.address || "place")}:${Number.isFinite(lat) ? lat.toFixed(6) : ""}:${Number.isFinite(lng) ? lng.toFixed(6) : ""}`;
  }

  function makeRouteStopSnapshot(source, tripId, stopIndex, options = {}) {
    const lat = Number(source?.lat);
    const lng = Number(source?.lng);
    const stop = {
      id: `${tripId}-stop-${stopIndex + 1}`,
      name: String(source?.name || "未命名地点"),
      country: String(source?.country || ""),
      address: String(source?.address || ""),
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      note: String(source?.note || ""),
      kind: options.kind || "place",
      provider: source?.provider || "",
      providerPlaceId: source?.providerPlaceId || ""
    };
    stop.placeKey = routePlaceKey(stop);
    return stop;
  }

  function createRouteTripsFromLegacy(stages = legacyDefaultRouteStages, entries = seedDestinations, origin = defaultState?.origin) {
    const entryMap = new Map(entries.map(entry => [entry.id, entry]));
    return stages.map((stage, stageIndex) => {
      const tripId = stage.id || `route-trip-${stageIndex + 1}`;
      const stops = (stage.stopIds || []).map((stopId, stopIndex) => {
        const source = stopId === "origin"
          ? { ...origin, country:"" }
          : entryMap.get(stopId) || seedDestinations.find(seed => seed.id === stopId) || { name:stopId };
        return makeRouteStopSnapshot(source, tripId, stopIndex, { kind:stopId === "origin" ? "origin" : "place" });
      });
      return {
        id: tripId,
        title: String(stage.title || `旅行 ${stageIndex + 1}`),
        note: String(stage.note || ""),
        start: String(stage.start || ""),
        end: String(stage.end || ""),
        current: Boolean(stage.current),
        stops
      };
    });
  }

  function createDefaultRouteTrips(entries, origin) {
    return createRouteTripsFromLegacy(legacyDefaultRouteStages, entries, origin);
  }

  function normalizeRouteTrips(savedTrips = []) {
    return savedTrips.map((trip, tripIndex) => {
      const tripId = trip?.id || `route-trip-${tripIndex + 1}-${crypto.randomUUID()}`;
      return {
        id: tripId,
        title: String(trip?.title || `旅行 ${tripIndex + 1}`),
        note: String(trip?.note || ""),
        start: String(trip?.start || ""),
        end: String(trip?.end || ""),
        current: Boolean(trip?.current),
        stops: Array.isArray(trip?.stops)
          ? trip.stops.map((stop, stopIndex) => {
            const snapshot = makeRouteStopSnapshot(stop, tripId, stopIndex, { kind:stop?.kind || "place" });
            snapshot.id = stop?.id || snapshot.id;
            snapshot.placeKey = stop?.placeKey || routePlaceKey(snapshot);
            return snapshot;
          })
          : []
      };
    });
  }

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn(`Unable to read ${key}`, error);
      return null;
    }
  }

  function readCurrentState() {
    const settings = readJSON(SETTINGS_STORAGE_KEY);
    const journalEntries = readJSON(JOURNAL_STORAGE_KEY);
    const routeTrips = readJSON(ROUTES_STORAGE_KEY);
    if (!settings && journalEntries === null && routeTrips === null) return null;
    return {
      ...(settings || {}),
      journalEntries: Array.isArray(journalEntries) ? journalEntries : null,
      routeTrips: Array.isArray(routeTrips) ? routeTrips : null
    };
  }

  function readLegacyState() {
    const keys = [LEGACY_STATE_KEY, ...LEGACY_KEYS];
    for (const key of keys) {
      const parsed = readJSON(key);
      if (parsed && Array.isArray(parsed.destinations)) return parsed;
    }
    return null;
  }

  function persistState(value) {
    const { journalEntries, routeTrips, ...settings } = value;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journalEntries));
      localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routeTrips));
    } catch (error) {
      console.warn("Unable to save Travel Reverie data", error);
    }
  }

  function loadState() {
    const current = readCurrentState();
    const legacy = current ? null : readLegacyState();
    const source = current || legacy;
    const legacyEntries = legacy?.destinations;
    const sourceEntries = current?.journalEntries ?? legacyEntries;
    const journalEntries = Array.isArray(sourceEntries)
      ? migrateJournalEntries(sourceEntries)
      : structuredClone(seedDestinations);
    const origin = { ...defaultState.origin, ...(source?.origin || {}) };
    const routeTrips = current && Array.isArray(current.routeTrips)
      ? normalizeRouteTrips(current.routeTrips)
      : createRouteTripsFromLegacy(legacy?.routeStages || legacyDefaultRouteStages, journalEntries, origin);
    const merged = {
      ...structuredClone(defaultState),
      ...(source || {}),
      schemaVersion: 7,
      memoryStyle: MEMORY_STYLE_IDS.includes(source?.memoryStyle) ? source.memoryStyle : "oil",
      origin,
      journalEntries,
      routeTrips,
      musicTracks: Array.isArray(source?.musicTracks) ? source.musicTracks : []
    };
    delete merged.destinations;
    delete merged.routeStages;
    merged.font = normalizeFontChoice(merged.font);
    persistState(merged);
    return merged;
  }

  function saveState() {
    state.schemaVersion = 7;
    state.memoryStyle = MEMORY_STYLE_IDS.includes(state.memoryStyle) ? state.memoryStyle : "oil";
    state.font = normalizeFontChoice(state.font);
    persistState(state);
    const status = $("#saveStatus");
    if (status) status.textContent = t("savedLocally");
  }
  const t = key => (i18n[state.language] && i18n[state.language][key]) || (i18n.en && i18n.en[key]) || key;

  function applyI18n() {
    document.documentElement.lang = state.language;
    $("#languageSelect").value = state.language;
    $$("[data-i18n]").forEach(el => { const key = el.dataset.i18n; if (t(key)) el.textContent = t(key); });
    $$("[data-i18n-placeholder]").forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
    updateThemeStudioCapabilities();
    renderAll();
  }


  function updateThemeStudioCapabilities() {
    const capabilities =
      MEMORY_THEME_CAPABILITIES[state.memoryStyle] ||
      MEMORY_THEME_CAPABILITIES.oil;
    const disabledLabels = [];

    Object.entries(capabilities).forEach(([key, enabled]) => {
      const input = document.getElementById(key);
      const label = document.querySelector(`[data-color-control="${key}"]`);
      if (!input) return;

      input.disabled = !enabled;
      input.setAttribute("aria-disabled", String(!enabled));
      label?.classList.toggle("is-control-disabled", !enabled);

      if (!enabled && label) {
        label.title = state.language === "en"
          ? "This color is fixed by the current memory style."
          : "当前记忆风格为保证视觉语言，锁定了此颜色。";
        disabledLabels.push(
          label.querySelector("span")?.textContent?.trim() || key
        );
      } else if (label) {
        label.removeAttribute("title");
      }
    });

    const note = document.getElementById("themeCapabilityNote");
    if (!note) return;

    if (disabledLabels.length) {
      note.textContent = state.language === "en"
        ? `${disabledLabels.join(", ")} is locked for this memory style.`
        : `${disabledLabels.join("、")}在当前 Memory 中由风格系统锁定。`;
    } else {
      note.textContent = state.language === "en"
        ? "Font and color controls are active in this memory style."
        : "当前 Memory 支持字体与页面颜色同步调整。";
    }
  }

  function applyTheme() {
    const root = document.documentElement;
    const config = currentMemoryConfig();

    state.font = normalizeFontChoice(state.font);
    const handwritten = isHandwrittenFont(state.font);
    const displayFont = state.font;
    const bodyFont = state.font;

    root.dataset.fontMood = handwritten ? "handwritten" : "standard";
    root.dataset.themeScene = state.scene;
    root.style.setProperty("--oil-ui-font", state.font);
    root.style.setProperty("--theme-selected-font", state.font);
    root.style.setProperty("--ui-font", bodyFont);
    root.style.setProperty("--body-font", bodyFont);
    root.style.setProperty("--display-font", displayFont);
    root.style.setProperty("--memory-interface-font", config.interface);
    root.style.setProperty("--pixel-font", MEMORY_STYLE_CONFIG.y2k.interface);
    root.style.setProperty(
      "--heading-font-weight",
      handwritten ? "400" : "600"
    );
    root.style.setProperty(
      "--heading-letter-spacing",
      handwritten ? ".01em" : "-.015em"
    );

    requestSelectedFonts(state.font);
    requestSelectedFonts(config.interface);

    root.style.setProperty("--title-color", state.titleColor);
    root.style.setProperty("--ink", state.inkColor);
    root.style.setProperty("--accent", state.accentColor);
    root.style.setProperty("--paper", state.paperColor);

    $("#sceneSelect").value = state.scene;
    $("#fontSelect").value = state.font;
    $("#titleColor").value = state.titleColor;
    $("#inkColor").value = state.inkColor;
    $("#accentColor").value = state.accentColor;
    $("#paperColor").value = state.paperColor;

    updateThemeStudioCapabilities();
    painting?.setScene(state.scene, state.customBackground);
  }


  function applyGlobeMemoryStyle() {
    if (!globe) return;

    const config = currentMemoryConfig();
    callGlobeMethod(globe, "pointColor", data => memoryPointColor(data));

    try {
      const material = globe.globeMaterial?.();
      material?.color?.set?.(config.globe[0]);
      material?.emissive?.set?.(config.globe[1]);
      if (material) material.emissiveIntensity = config.globe[2];
    } catch (_) {}

    lastGlobeSignature = "";
    updateGlobeData(true);
  }

  function applyMemoryStyle(nextStyle = state.memoryStyle, options = {}) {
    const root = document.documentElement;
    const style = MEMORY_STYLE_IDS.includes(nextStyle) ? nextStyle : "oil";
    const changed = state.memoryStyle !== style || root.dataset.memoryStyle !== style;

    state.memoryStyle = style;
    root.dataset.memoryStyle = style;

    const selector = $("#memoryStyleSelect");
    if (selector) selector.value = style;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = currentMemoryConfig().themeColor;

    clearTimeout(memoryTransitionTimer);
    if (changed) {
      root.classList.add("memory-style-transitioning");
      memoryTransitionTimer = setTimeout(
        () => root.classList.remove("memory-style-transitioning"),
        820
      );
    }

    applyTheme();
    renderMemoryWorldChrome();

    if (style !== "oil" && $("#musicDock")?.classList.contains("open")) {
      setMusicDockOpen(false);
    }

    if (options.persist) saveState();

    if (options.rerender) {
      renderAll();
      if (map) {
        lastMapSignature = "";
        updateMap(true);
      }
      applyGlobeMemoryStyle();
    }

    refreshEditorialDoodles();
    document.dispatchEvent(new CustomEvent("travel-memory-style-change", {
      detail:{ style }
    }));
  }

  function formatDate(d) {
    if (!d) return "";
    try { return new Intl.DateTimeFormat(state.language, { year:"numeric", month:"short", day:"numeric" }).format(new Date(d + "T00:00:00")); }
    catch (_) { return d; }
  }

  function dateRange(item) {
    const a = formatDate(item.start), b = formatDate(item.end);
    if (!a && !b) return t("undated");
    if (a && b && a !== b) return `${a} — ${b}`;
    return a || b;
  }
  const escapeHTML = (str = "") => str.replace(/[&<>"']/g, s => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" })[s]);
  const safeColor = (c, fallback="#c9b8b1") => /^#[0-9a-f]{6}$/i.test(c || "") ? c : fallback;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE, { keyPath:"id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  async function saveMediaBlob(destinationId, file) {
    const db = await openDB();
    const id = crypto.randomUUID();
    const record = { id, destinationId, name:file.name, type:file.type, blob:file, createdAt:Date.now() };
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(record);
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
    return { id, name:file.name, type:file.type };
  }
  async function getMediaRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => { const req = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(id); req.onsuccess = () => resolve(req.result || null); req.onerror = () => reject(req.error); });
  }
  async function removeMediaRecord(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => { const tx = db.transaction(DB_STORE, "readwrite"); tx.objectStore(DB_STORE).delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
  }
  function clearMediaUrls() { mediaUrls.forEach(url => URL.revokeObjectURL(url)); mediaUrls = []; }

  function flattenRoutePoints() {
    const points = [];
    state.routeTrips.forEach((trip, tripIndex) => {
      trip.stops.forEach((stop, stopIndex) => {
        if (Number.isFinite(Number(stop.lat)) && Number.isFinite(Number(stop.lng))) {
          points.push({ ...stop, tripIndex, order: points.length + 1, localIndex: stopIndex, current:Boolean(trip.current) });
        }
      });
    });
    return points;
  }
  function uniqueStopsFromRoute() {
    const map = new Map();
    flattenRoutePoints().forEach((p, i) => {
      const key = p.placeKey || routePlaceKey(p);
      if (!map.has(key)) map.set(key, { ...p, visits:[i + 1] });
      else {
        const saved = map.get(key);
        saved.visits.push(i + 1);
        saved.current ||= Boolean(p.current);
      }
    });
    return [...map.values()];
  }
  function allMapPoints() {
    return uniqueStopsFromRoute();
  }

  function ensureContentObservers() {
    if (!revealObserver && window.IntersectionObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin:"120px 0px", threshold:.08 });
    }
    if (!mediaVisibilityObserver && window.IntersectionObserver) {
      mediaVisibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const media = entry.target;
          if (media.tagName !== "VIDEO") return;
          if (entry.isIntersecting) media.play().catch(() => {});
          else media.pause();
        });
      }, { rootMargin:"160px 0px", threshold:.15 });
    }
  }

  function observeCard(card) {
    ensureContentObservers();
    if (!revealObserver || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.classList.add("is-visible");
      return;
    }
    revealObserver.observe(card);
  }

  function stableHash(value = "") {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function coverGradient(item) {
    const palettes = [
      ["#7f93a4", "#b9a7b7", "#e0c7b7"],
      ["#8aa5a5", "#c2b7a5", "#8e7e91"],
      ["#9c8aa6", "#728ba0", "#d7b5ad"],
      ["#b29a82", "#8fa6aa", "#d6cbbb"],
      ["#7894a1", "#9b8fa7", "#d9b7a2"],
      ["#84978a", "#b6a4a8", "#7c8599"]
    ];
    const seed = stableHash(`${item.id || ""}:${item.name || ""}`);
    const colors = palettes[seed % palettes.length];
    const angle = 118 + (seed % 43);
    return `radial-gradient(circle at ${28 + seed % 45}% ${18 + seed % 38}%, rgba(255,255,255,.58), transparent 22%), linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]} 52%, ${colors[2]})`;
  }

  function renderFallbackCover(container, item) {
    const art = document.createElement("div");
    art.className = "placeholder-art";
    art.style.background = coverGradient(item);
    art.textContent = item.name.split("·")[0].trim();
    container.appendChild(art);
  }

  async function renderStoredMediaOrFallback(container, item) {
    if (!item.media || !item.media.length) {
      renderFallbackCover(container, item);
      return;
    }
    try {
      const rec = await getMediaRecord(item.media[0].id);
      if (!rec) throw new Error("missing");
      const url = URL.createObjectURL(rec.blob);
      mediaUrls.push(url);
      const isVideo = rec.type.startsWith("video/");
      const element = isVideo ? document.createElement("video") : document.createElement("img");
      element.src = url;
      element.alt = item.name;
      if (isVideo) {
        element.muted = true;
        element.loop = true;
        element.playsInline = true;
        element.preload = "metadata";
        ensureContentObservers();
        mediaVisibilityObserver?.observe(element);
      } else {
        element.loading = "lazy";
        element.decoding = "async";
        element.fetchPriority = "low";
      }
      container.appendChild(element);
    } catch (_) {
      item.media = [];
      renderFallbackCover(container, item);
    }
  }

  async function renderMedia(container, item) {
    container.innerHTML = "";
    container.style.setProperty("--cover-gradient", coverGradient(item));
    const remoteCover = String(item.coverUrl || item.coverImage || item.imageUrl || "").trim();

    if (remoteCover) {
      const image = document.createElement("img");
      image.className = "remote-cover-image";
      image.src = remoteCover;
      image.alt = item.name;
      image.loading = "lazy";
      image.decoding = "async";
      image.fetchPriority = "low";
      image.addEventListener("error", async () => {
        image.remove();
        await renderStoredMediaOrFallback(container, item);
      }, { once:true });
      container.appendChild(image);
      return;
    }

    await renderStoredMediaOrFallback(container, item);
  }


  const MEMORY_CARD_SYMBOLS = ["💿","📼","📸","🩷","🐰","🦋","✨","💌","⭐","🍀","🫧","📍"];
  const MEMORY_CARD_WORDS = [
    "DREAM TRIP","LOST & FOUND","SUMMER FILE","MEMORY LOOP",
    "POSTCARD","SAVED LIGHT","CITY DIARY","AFTERGLOW"
  ];
  const FILM_CARD_WORDS = [
    "SCENE MEMORY","LOCATION CUT","TRAVEL TAKE","DAYLIGHT UNIT",
    "NIGHT WALK","SECOND ACT","LAST TRAIN","CITY CLOSE-UP"
  ];

  function renderMemoryWorldChrome() {
    const host = $("#memoryWorldChrome");
    if (!host) return;

    host.innerHTML = "";
    const style = state.memoryStyle;
    const random = createSessionRandom(`travelReverieWorldChrome-${style}-v1`);

    const glyphSets = {
      oil:["✦","·","◌"],
      y2k:["♥","★","☺","✦","☁","◇"],
      film:["REC","24","◼","00:24","CUT"],
      sketchbook:["↗","○","note","!","→"],
      watercolor:["·","◌","≈","○","﹏"]
    };
    const counts = { oil:3, y2k:11, film:6, sketchbook:7, watercolor:5 };
    const glyphs = glyphSets[style] || glyphSets.oil;
    const count = counts[style] || 3;

    for (let index = 0; index < count; index += 1) {
      const sprite = document.createElement("span");
      sprite.className = `memory-world-sprite memory-world-sprite-${style}`;
      sprite.textContent = glyphs[index % glyphs.length];

      const side = index % 4;
      const x = side === 0
        ? 2 + random()*12
        : side === 1
          ? 86 + random()*11
          : 10 + random()*80;
      const y = side === 2
        ? 3 + random()*14
        : side === 3
          ? 82 + random()*15
          : 8 + random()*82;

      sprite.style.left = `${x.toFixed(2)}%`;
      sprite.style.top = `${y.toFixed(2)}%`;
      sprite.style.setProperty("--sprite-delay", `${(-random()*8).toFixed(2)}s`);
      sprite.style.setProperty("--sprite-duration", `${(7+random()*7).toFixed(2)}s`);
      sprite.style.setProperty("--sprite-scale", `${(.78+random()*.54).toFixed(2)}`);
      sprite.dataset.depth = String(index % 3);
      host.appendChild(sprite);
    }
  }

  function memoryCardData(item, index) {
    const hash = stableHash(`${item.id}:${item.name}:${item.country}:${index}`);
    const city = String(item.name || "").split("·")[0].trim();
    const country = String(item.country || "").split("·")[0].trim();
    const year = item.start?.slice(0,4) || "MEM";
    const symbol = MEMORY_CARD_SYMBOLS[hash % MEMORY_CARD_SYMBOLS.length];
    const word = MEMORY_CARD_WORDS[(hash >>> 3) % MEMORY_CARD_WORDS.length];
    const filmWord = FILM_CARD_WORDS[(hash >>> 5) % FILM_CARD_WORDS.length];
    const serial = String((hash % 9973) + 1).padStart(4, "0");
    const frame = String((hash % 24) + 1).padStart(2, "0");
    const minute = String((hash % 59)).padStart(2, "0");
    const second = String(((hash >>> 4) % 59)).padStart(2, "0");
    return { city, country, year, symbol, word, filmWord, serial, frame, minute, second, hash };
  }

  function decorateMemoryCard(card, item, index) {
    const data = memoryCardData(item, index);
    const media = $(".media-frame", card);
    if (!media) return;

    card.dataset.memoryVariant = String(data.hash % 6);
    card.dataset.memorySymbol = data.symbol;
    card.dataset.memoryYear = data.year;

    const cover = document.createElement("div");
    cover.className = "memory-cover-design";
    cover.setAttribute("aria-hidden", "true");
    cover.innerHTML = `
      <div class="cover-y2k">
        <span class="cover-y2k-kicker">${escapeHTML(data.word)}</span>
        <strong>PIXEL ${escapeHTML(data.city.toUpperCase())}</strong>
        <small>${escapeHTML(data.country)} · ${escapeHTML(data.year)}</small>
        <i>${escapeHTML(data.symbol)}</i>
        <b>FILE_${escapeHTML(data.serial)}</b>
      </div>
      <div class="cover-film">
        <span>SCENE ${escapeHTML(data.frame)} · ${escapeHTML(data.filmWord)}</span>
        <strong>${escapeHTML(data.city)}</strong>
        <small>${escapeHTML(data.country)} / ${escapeHTML(data.year)}</small>
        <time>00:${escapeHTML(data.minute)}:${escapeHTML(data.second)}:${escapeHTML(data.frame)}</time>
      </div>
      <div class="cover-sketchbook">
        <span>field note ${escapeHTML(data.serial)}</span>
        <strong>${escapeHTML(data.city)}</strong>
        <small>${escapeHTML(data.country)} · ${escapeHTML(data.year)}</small>
        <i>↗</i>
      </div>
      <div class="cover-watercolor">
        <strong>${escapeHTML(data.city)}</strong>
        <span>${escapeHTML(data.year)} · remembered in water</span>
      </div>
      <div class="cover-oil">
        <span>TRAVEL REVERIE COLLECTION</span>
        <strong>${escapeHTML(data.city)}</strong>
        <small>${escapeHTML(data.country)} · ${escapeHTML(data.year)}</small>
      </div>`;
    media.appendChild(cover);

    const chrome = document.createElement("div");
    chrome.className = "memory-card-chrome";
    chrome.setAttribute("aria-hidden", "true");
    chrome.innerHTML = `
      <span class="memory-card-symbol">${escapeHTML(data.symbol)}</span>
      <span class="memory-card-label">${escapeHTML(data.word)}</span>
      <span class="memory-card-serial">NO.${escapeHTML(data.serial)}</span>`;
    card.appendChild(chrome);
  }

  async function renderJournal() {
    const grid = $("#journalGrid");
    $$("video", grid).forEach(video => mediaVisibilityObserver?.unobserve(video));
    $$(".reveal-item", grid).forEach(card => revealObserver?.unobserve(card));
    clearMediaUrls();
    grid.innerHTML = "";
    const q = $("#searchInput").value.trim().toLowerCase();
    const cf = $("#countryFilter").value;
    const tf = $("#typeFilter").value;
    const filtered = state.journalEntries.filter(item => {
      const hay = `${item.name} ${item.country} ${item.story}`.toLowerCase();
      return (!q || hay.includes(q)) && (cf === "all" || item.country === cf) && (tf === "all" || item.type === tf);
    });
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.textContent = t("noResults");
      empty.style.opacity = ".65";
      grid.appendChild(empty);
      return;
    }
    for (const [idx, item] of filtered.entries()) {
      const card = $("#cardTemplate").content.firstElementChild.cloneNode(true);
      card.classList.add("reveal-item");
      if (state.memoryStyle !== "oil") {
        card.classList.add("is-memory-collapsed");
        card.classList.remove("is-memory-expanded");
      }
      card.dataset.destinationId = item.id;
      card.style.setProperty("--card-accent", safeColor(item.color));
      const doodleIntervals = {
        oil:8, y2k:4, film:10, sketchbook:5, watercolor:8
      };
      const doodleInterval = doodleIntervals[state.memoryStyle] || 8;
      if (idx % doodleInterval === 0) {
        card.dataset.doodle = doodles[(idx / doodleInterval) % doodles.length | 0];
      }
      const y2kTilts = [-1.05, .72, -.42, .94, -.68, .35];
      card.style.setProperty("--y2k-tilt", `${y2kTilts[idx % y2kTilts.length]}deg`);
      const typeText = typeLabels[state.language]?.[item.type] || item.type;
      $(".trip-type", card).textContent = item.status === "current" ? `${typeText} · CURRENT` : typeText;
      card.classList.toggle("current-destination", item.status === "current");
      $(".trip-date", card).textContent = dateRange(item);
      $("h3", card).textContent = item.name;
      $(".country-line", card).textContent = item.country;
      $(".story", card).textContent = item.story || t("emptyStory");
      $(".coordinate", card).textContent = Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)) ? `${Number(item.lat).toFixed(3)}, ${Number(item.lng).toFixed(3)}` : "no coordinates";
      $(".edit-trip", card).textContent = t("edit");
      $(".edit-trip", card).addEventListener("click", () => openTripDialog(item.id));
      renderMedia($(".media-frame", card), item);
      decorateMemoryCard(card, item, idx);
      grid.appendChild(card);
      if (state.memoryStyle === "film") {
        card.classList.add("is-visible");
      } else {
        observeCard(card);
      }
    }
  }

  function buildCountryFilter() {
    const select = $("#countryFilter"); const current = select.value || "all";
    select.innerHTML = `<option value="all">${escapeHTML(t("allCountries"))}</option>`;
    [...new Set(state.journalEntries.map(d => d.country).filter(Boolean))].sort().forEach(country => { const opt = document.createElement("option"); opt.value = country; opt.textContent = country; select.appendChild(opt); });
    select.value = [...select.options].some(o => o.value === current) ? current : "all";
  }

  function renderArchive() {
    const grid = $("#archiveGrid"); grid.innerHTML = "";
    const groups = new Map();
    state.journalEntries.forEach(d => { const key = d.country || "Unknown"; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(d); });
    [...groups.entries()].sort((a,b) => a[0].localeCompare(b[0])).forEach(([country, items]) => {
      const card = document.createElement("button"); card.className = "archive-card"; card.style.setProperty("--archive-color", safeColor(items[0].color)); card.dataset.memoryIndex = String(stableHash(country) % 6);
      const years = [...new Set(items.map(x => x.start?.slice(0,4)).filter(Boolean))].sort();
      card.innerHTML = `<small>${escapeHTML(t("countryBook"))}</small><h3>${escapeHTML(country)}</h3><p>${items.length} ${escapeHTML(t("destinations"))}${years.length ? " · " + years.join(", ") : ""}</p>`;
      card.addEventListener("click", () => { $("#countryFilter").value = country; renderJournal(); location.hash = "#journal"; });
      grid.appendChild(card);
    });
    const yearGroups = new Map();
    state.journalEntries.forEach(d => { const year = d.start?.slice(0,4); if (!year) return; if (!yearGroups.has(year)) yearGroups.set(year, []); yearGroups.get(year).push(d); });
    [...yearGroups.entries()].sort((a,b) => b[0].localeCompare(a[0])).forEach(([year, items]) => {
      const card = document.createElement("button"); card.className = "archive-card"; card.style.setProperty("--archive-color", safeColor(items[0].color)); card.dataset.memoryIndex = String(stableHash(year) % 6);
      card.innerHTML = `<small>${escapeHTML(t("yearBookmark"))}</small><h3>${year}</h3><p>${items.length} ${escapeHTML(t("destinations"))}</p>`;
      card.addEventListener("click", () => { $("#searchInput").value = year; location.hash = "#journal"; renderJournal(); });
      grid.appendChild(card);
    });
  }

  function routeDateLabel(trip) {
    const start = String(trip.start || "").trim();
    const end = String(trip.end || "").trim();
    if (start && end) return start === end ? start : `${start} — ${end}`;
    return start || end || "";
  }

  function renderRouteTimeline() {
    const box = $("#routeTimeline");
    const toggle = $("#routeToggle");
    box.innerHTML = "";
    const startIndex = routeExpanded ? 0 : Math.max(0, state.routeTrips.length - ROUTE_PREVIEW_COUNT);

    if (!state.routeTrips.length) {
      box.innerHTML = `
        <section class="route-empty-state">
          <span>✦</span>
          <h4>还没有真实旅途路线</h4>
          <p>新建一次旅行后，地点会以独立模块显示在这里，并同步到地图。</p>
        </section>`;
    }

    state.routeTrips.forEach((trip, tripIndex) => {
      const color = routeColor(tripIndex);
      const panel = document.createElement("section");
      const hidden = !routeExpanded && tripIndex < startIndex;
      const tripExpanded = expandedRouteTripIds.has(trip.id);
      const visibleStops = tripExpanded
        ? trip.stops
        : trip.stops.slice(0, ROUTE_STOP_PREVIEW_COUNT);
      const hiddenStopCount = Math.max(0, trip.stops.length - visibleStops.length);
      const dateLabel = routeDateLabel(trip);
      panel.className = [
        "route-stage",
        trip.current ? "current-stage" : "",
        hidden ? "is-route-hidden" : "",
        tripExpanded ? "is-trip-expanded" : ""
      ].filter(Boolean).join(" ");

      panel.innerHTML = `
        <div class="route-card-head">
          <div class="route-card-title">
            ${trip.current ? `<span class="current-route-badge">${escapeHTML(t("currentStatus"))}</span>` : ""}
            <h4>${escapeHTML(trip.title || "未命名旅行")}</h4>
            ${dateLabel ? `<time>${escapeHTML(dateLabel)}</time>` : ""}
          </div>
          <span class="route-stop-count">${trip.stops.length}<small>地点</small></span>
        </div>
        ${trip.note ? `<p class="route-card-note">${escapeHTML(trip.note)}</p>` : ""}
        <div class="route-steps"></div>`;

      const stepsBox = $(".route-steps", panel);
      visibleStops.forEach((stop, stopIndex) => {
        const row = document.createElement("div");
        row.className = "route-step";
        row.innerHTML = `
          <div class="step-no" style="--route-step-color:${safeColor(color)}">${stopIndex + 1}</div>
          <div class="step-label">
            <b>${escapeHTML(stop.name || "未命名地点")}</b>
            <span>${escapeHTML(stop.country || stop.address || "未填写地区")}</span>
          </div>`;
        stepsBox.appendChild(row);
      });
      if (hiddenStopCount) {
        const more = document.createElement("div");
        more.className = "route-step-more";
        more.textContent = `还有 ${hiddenStopCount} 个地点`;
        stepsBox.appendChild(more);
      }

      const actions = document.createElement("div");
      actions.className = "route-stage-actions";
      if (trip.stops.length > ROUTE_STOP_PREVIEW_COUNT) {
        const expand = document.createElement("button");
        expand.type = "button";
        expand.className = "tiny-button route-trip-toggle";
        expand.setAttribute("aria-expanded", String(tripExpanded));
        expand.textContent = tripExpanded ? "收起地点" : `查看全部 ${trip.stops.length} 个地点`;
        expand.addEventListener("click", () => {
          if (tripExpanded) expandedRouteTripIds.delete(trip.id);
          else expandedRouteTripIds.add(trip.id);
          renderRouteTimeline();
        });
        actions.appendChild(expand);
      }
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "tiny-button";
      edit.textContent = "编辑路线";
      edit.addEventListener("click", () => openRouteDialog(trip.id));
      actions.appendChild(edit);
      panel.appendChild(actions);
      box.appendChild(panel);
    });

    if (toggle) {
      const hiddenCount = Math.max(0, state.routeTrips.length - ROUTE_PREVIEW_COUNT);
      toggle.hidden = hiddenCount === 0;
      toggle.setAttribute("aria-expanded", String(routeExpanded));
      const label = $("span", toggle);
      if (label) label.textContent = routeExpanded ? t("collapseRoutes") : `${t("expandRoutes")} · ${hiddenCount}`;
    }
  }

  function emptyRouteTrip() {
    return {
      id: `route-trip-${crypto.randomUUID()}`,
      title: "",
      note: "",
      start: "",
      end: "",
      current: false,
      stops: []
    };
  }

  function resetRouteGeocodeResults(message = "输入地点、国家或地址后搜索；也可手动填写坐标。") {
    routeGeocodeCandidates = [];
    $("#routeGeocodeResults").innerHTML = "";
    $("#routeGeocodeStatus").textContent = message;
  }

  function clearRouteStopFields() {
    activeRouteStopId = "";
    $("#routeStopId").value = "";
    $("#routeStopName").value = "";
    $("#routeStopCountry").value = "";
    $("#routeStopAddress").value = "";
    $("#routeStopLat").value = "";
    $("#routeStopLng").value = "";
    $("#routeStopNote").value = "";
    $("#routeStopFieldsHeading").textContent = "添加地点";
    $("#deleteRouteStop").classList.add("hidden");
    resetRouteGeocodeResults();
  }

  function populateRouteStopFields(stop) {
    activeRouteStopId = stop.id;
    $("#routeStopId").value = stop.id;
    $("#routeStopName").value = stop.name || "";
    $("#routeStopCountry").value = stop.country || "";
    $("#routeStopAddress").value = stop.address || "";
    $("#routeStopLat").value = stop.lat ?? "";
    $("#routeStopLng").value = stop.lng ?? "";
    $("#routeStopNote").value = stop.note || "";
    $("#routeStopFieldsHeading").textContent = "编辑地点";
    $("#deleteRouteStop").classList.remove("hidden");
    resetRouteGeocodeResults();
  }

  function routeStopFormHasContent() {
    return [
      "#routeStopName", "#routeStopCountry", "#routeStopAddress",
      "#routeStopLat", "#routeStopLng", "#routeStopNote"
    ].some(selector => String($(selector).value || "").trim());
  }

  function saveActiveRouteStop({ quiet = false } = {}) {
    if (!routeEditorDraft) return false;
    const name = $("#routeStopName").value.trim();
    if (!name && !routeStopFormHasContent()) return true;
    if (!name) {
      if (!quiet) alert("请至少填写地点名称，再保存地点。");
      return false;
    }

    const existingIndex = routeEditorDraft.stops.findIndex(stop => stop.id === activeRouteStopId);
    const existing = existingIndex >= 0 ? routeEditorDraft.stops[existingIndex] : null;
    const snapshot = makeRouteStopSnapshot({
      name,
      country: $("#routeStopCountry").value.trim(),
      address: $("#routeStopAddress").value.trim(),
      lat: $("#routeStopLat").value === "" ? null : Number($("#routeStopLat").value),
      lng: $("#routeStopLng").value === "" ? null : Number($("#routeStopLng").value),
      note: $("#routeStopNote").value.trim(),
      provider: existing?.provider || "",
      providerPlaceId: existing?.providerPlaceId || ""
    }, routeEditorDraft.id, Math.max(0, existingIndex), { kind:existing?.kind || "place" });
    snapshot.id = existing?.id || `route-stop-${crypto.randomUUID()}`;
    snapshot.placeKey = routePlaceKey(snapshot);

    if (existingIndex >= 0) routeEditorDraft.stops.splice(existingIndex, 1, snapshot);
    else routeEditorDraft.stops.push(snapshot);
    activeRouteStopId = snapshot.id;
    $("#routeStopId").value = snapshot.id;
    $("#routeStopFieldsHeading").textContent = "编辑地点";
    $("#deleteRouteStop").classList.remove("hidden");
    renderRouteStopList();
    return true;
  }

  function renderRouteStopList() {
    const box = $("#routeStopList");
    box.innerHTML = "";
    const stops = routeEditorDraft?.stops || [];
    if (!stops.length) {
      const empty = document.createElement("p");
      empty.className = "route-stop-empty";
      empty.textContent = "还没有地点。添加起点、途经地或终点后，地图会立即使用这条路线。";
      box.appendChild(empty);
      return;
    }
    stops.forEach((stop, index) => {
      const row = document.createElement("div");
      row.className = `route-stop-row${stop.id === activeRouteStopId ? " is-active" : ""}`;
      row.innerHTML = `
        <button type="button" class="route-stop-select"><b>${index + 1}. ${escapeHTML(stop.name)}</b><span>${escapeHTML(stop.country || stop.address || "未填写地区")}</span></button>
        <button type="button" class="route-stop-move" aria-label="上移地点" ${index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="route-stop-move" aria-label="下移地点" ${index === stops.length - 1 ? "disabled" : ""}>↓</button>`;
      $(".route-stop-select", row).addEventListener("click", () => selectRouteStop(stop.id));
      const moveButtons = $$(".route-stop-move", row);
      moveButtons[0].addEventListener("click", () => moveRouteStop(stop.id, -1));
      moveButtons[1].addEventListener("click", () => moveRouteStop(stop.id, 1));
      box.appendChild(row);
    });
  }

  function selectRouteStop(id) {
    if (activeRouteStopId !== id && !saveActiveRouteStop({ quiet:true })) return;
    const stop = routeEditorDraft?.stops.find(item => item.id === id);
    if (!stop) return;
    populateRouteStopFields(stop);
    renderRouteStopList();
  }

  function startNewRouteStop() {
    if (!saveActiveRouteStop({ quiet:true })) return;
    clearRouteStopFields();
    renderRouteStopList();
    $("#routeStopName").focus();
  }

  function moveRouteStop(id, direction) {
    if (!saveActiveRouteStop({ quiet:true })) return;
    const index = routeEditorDraft?.stops.findIndex(stop => stop.id === id) ?? -1;
    const target = index + direction;
    if (index < 0 || target < 0 || target >= routeEditorDraft.stops.length) return;
    [routeEditorDraft.stops[index], routeEditorDraft.stops[target]] = [routeEditorDraft.stops[target], routeEditorDraft.stops[index]];
    renderRouteStopList();
  }

  function deleteActiveRouteStop() {
    if (!activeRouteStopId || !routeEditorDraft) return;
    const stop = routeEditorDraft.stops.find(item => item.id === activeRouteStopId);
    if (!stop || !confirm(`删除地点“${stop.name}”？`)) return;
    routeEditorDraft.stops = routeEditorDraft.stops.filter(item => item.id !== activeRouteStopId);
    clearRouteStopFields();
    renderRouteStopList();
  }

  function openRouteDialog(id = "") {
    const existing = id ? state.routeTrips.find(trip => trip.id === id) : null;
    routeEditorDraft = structuredClone(existing || emptyRouteTrip());
    activeRouteStopId = "";
    $("#routeTripId").value = routeEditorDraft.id;
    $("#routeTripTitle").value = routeEditorDraft.title || "";
    $("#routeTripNote").value = routeEditorDraft.note || "";
    $("#routeTripStart").value = routeEditorDraft.start || "";
    $("#routeTripEnd").value = routeEditorDraft.end || "";
    $("#routeTripCurrent").checked = Boolean(routeEditorDraft.current);
    $("#routeDialogTitle").textContent = existing ? "编辑这次旅行" : "新建一次旅行";
    $("#deleteRouteTrip").classList.toggle("hidden", !existing);
    clearRouteStopFields();
    renderRouteStopList();
    $("#routeDialog").showModal();
    document.body.classList.add("modal-open");
  }

  function closeRouteDialog() {
    const dialog = $("#routeDialog");
    if (dialog.open) dialog.close();
    routeEditorDraft = null;
    activeRouteStopId = "";
    routeGeocodeCandidates = [];
    document.body.classList.remove("modal-open");
  }

  function refreshRouteViews() {
    lastMapSignature = "";
    lastGlobeSignature = "";
    renderRouteTimeline();
    updateMap(true);
    updateGlobeData(true);
  }

  function submitRouteTrip(event) {
    event.preventDefault();
    if (!routeEditorDraft || !saveActiveRouteStop()) return;
    const title = $("#routeTripTitle").value.trim();
    if (!title) {
      alert("请填写这次旅行的名称。");
      return;
    }
    if (!routeEditorDraft.stops.length) {
      alert("请至少添加一个路线地点。");
      return;
    }
    Object.assign(routeEditorDraft, {
      title,
      note: $("#routeTripNote").value.trim(),
      start: $("#routeTripStart").value,
      end: $("#routeTripEnd").value,
      current: $("#routeTripCurrent").checked
    });
    if (routeEditorDraft.current) state.routeTrips.forEach(trip => { trip.current = false; });
    const existingIndex = state.routeTrips.findIndex(trip => trip.id === routeEditorDraft.id);
    if (existingIndex >= 0) state.routeTrips.splice(existingIndex, 1, structuredClone(routeEditorDraft));
    else state.routeTrips.push(structuredClone(routeEditorDraft));
    saveState();
    closeRouteDialog();
    refreshRouteViews();
  }

  function deleteRouteTrip() {
    if (!routeEditorDraft) return;
    if (!confirm(`删除旅行“${routeEditorDraft.title || "未命名旅行"}”？`)) return;
    state.routeTrips = state.routeTrips.filter(trip => trip.id !== routeEditorDraft.id);
    saveState();
    closeRouteDialog();
    refreshRouteViews();
  }

  async function geocodeRouteStop() {
    const query = [
      $("#routeStopName").value.trim(),
      $("#routeStopAddress").value.trim(),
      $("#routeStopCountry").value.trim()
    ].filter(Boolean).join(" ");
    if (!query) {
      $("#routeGeocodeStatus").textContent = "请先输入地点、国家或详细地址。";
      return;
    }
    const button = $("#routeGeocodeBtn");
    button.disabled = true;
    $("#routeGeocodeStatus").textContent = "正在搜索地点…";
    $("#routeGeocodeResults").innerHTML = "";
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&accept-language=${encodeURIComponent(state.language)}&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, { headers:{ Accept:"application/json" } });
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      routeGeocodeCandidates = await response.json();
      if (!routeGeocodeCandidates.length) {
        $("#routeGeocodeStatus").textContent = "没有找到匹配地点，请修改关键词或手动填写坐标。";
        return;
      }
      $("#routeGeocodeStatus").textContent = "选择一个结果以写入地点和坐标。数据来源：OpenStreetMap / Nominatim。";
      const results = $("#routeGeocodeResults");
      routeGeocodeCandidates.forEach((candidate, index) => {
        const result = document.createElement("button");
        result.type = "button";
        result.className = "route-geocode-result";
        const name = candidate.name || String(candidate.display_name || "").split(",")[0] || "未命名地点";
        result.innerHTML = `<b>${escapeHTML(name)}</b><span>${escapeHTML(candidate.display_name || "")}</span>`;
        result.addEventListener("click", () => applyRouteGeocodeCandidate(index));
        results.appendChild(result);
      });
    } catch (error) {
      console.warn("Route location search failed", error);
      $("#routeGeocodeStatus").textContent = "搜索失败，请检查网络或手动填写坐标。";
    } finally {
      button.disabled = false;
    }
  }

  function applyRouteGeocodeCandidate(index) {
    const candidate = routeGeocodeCandidates[index];
    if (!candidate) return;
    const displayName = String(candidate.display_name || "");
    const name = candidate.name || displayName.split(",")[0] || "";
    $("#routeStopName").value = name;
    $("#routeStopCountry").value = candidate.address?.country || $("#routeStopCountry").value;
    $("#routeStopAddress").value = displayName;
    $("#routeStopLat").value = Number(candidate.lat).toFixed(6);
    $("#routeStopLng").value = Number(candidate.lon).toFixed(6);
    $("#routeGeocodeStatus").textContent = "已写入地点与坐标；点击“保存地点到这次旅行”确认。";
    $("#routeGeocodeResults").innerHTML = "";
  }

  function renderAll() {
    $("#destinationCount").textContent = state.journalEntries.length;
    buildCountryFilter(); renderJournal(); renderArchive(); renderRouteTimeline(); updateMap(); renderPlaylist();
  }

  function setMapLoader(messageKey = "mapLoading", visible = true) {
    const overlay = $("#mapLoadingOverlay");
    if (!overlay) return;
    overlay.textContent = t(messageKey);
    overlay.style.display = visible ? "grid" : "none";
    overlay.classList.toggle("hidden", !visible);
  }

  function hideMapLoader() {
    clearTimeout(mapLoaderTimer);
    const overlay = $("#mapLoadingOverlay");
    if (!overlay) return;
    overlay.classList.add("hidden");
    setTimeout(() => { if (overlay.classList.contains("hidden")) overlay.style.display = "none"; }, 650);
  }

  function loadScriptOnce(src, globalName) {
    if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
    const existing = document.querySelector(`script[data-dynamic-src="${src}"]`);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", () => resolve(globalName ? window[globalName] : true), { once:true });
        existing.addEventListener("error", reject, { once:true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.dynamicSrc = src;
      script.onload = () => resolve(globalName ? window[globalName] : true);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureLeaflet() {
    if (window.L) return window.L;
    try {
      await loadScriptOnce("https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js", "L");
      return window.L;
    } catch (primaryError) {
      try {
        await loadScriptOnce("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "L");
        return window.L;
      } catch (fallbackError) {
        console.error("Leaflet failed to load", primaryError, fallbackError);
        return null;
      }
    }
  }

  function createTileLayer(url, attribution) {
    return L.tileLayer(url, {
      maxZoom: 19,
      minZoom: 1,
      attribution,
      crossOrigin: false,
      updateWhenIdle: false,
      updateWhenZooming: false,
      updateInterval: 160,
      keepBuffer: 5,
      detectRetina: false,
      noWrap: false
    });
  }

  function attachTileEvents(layer) {
    layer.on("loading", () => setMapLoader("mapLoading", true));
    layer.on("tileload", () => {
      if (!firstTileReady) {
        firstTileReady = true;
        hideMapLoader();
      }
    });
    layer.on("load", () => {
      tileErrorCount = 0;
      hideMapLoader();
    });
    layer.on("tileerror", () => {
      tileErrorCount += 1;
      if (tileErrorCount >= 6 && !tileFallbackUsed) switchToFallbackTiles();
    });
  }

  function switchToFallbackTiles() {
    if (!map || tileFallbackUsed) return;
    tileFallbackUsed = true;
    tileErrorCount = 0;
    firstTileReady = false;
    if (tileLayer) map.removeLayer(tileLayer);
    tileLayer = createTileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "&copy; OpenStreetMap contributors"
    );
    attachTileEvents(tileLayer);
    tileLayer.addTo(map);
    mapLoaderTimer = setTimeout(() => hideMapLoader(), 8000);
  }

  async function initMap() {
    if (map) {
      scheduleMapStabilization();
      return map;
    }
    const Leaflet = await ensureLeaflet();
    if (!Leaflet) {
      setMapLoader("mapUnavailable", true);
      return null;
    }

    setMapLoader("mapLoading", true);
    const renderer = L.canvas({ padding: 0.35, tolerance: 8 });
    map = L.map("map2d", {
      zoomControl: true,
      worldCopyJump: true,
      minZoom: 1.5,
      maxZoom: 7,
      zoomSnap: .25,
      zoomDelta: .5,
      preferCanvas: true,
      renderer,
      zoomAnimation: true,
      fadeAnimation: false,
      markerZoomAnimation: false,
      dragging: true,
      touchZoom: true,
      inertia: true,
      inertiaDeceleration: 3400,
      inertiaMaxSpeed: 1200,
      easeLinearity: .22,
      boxZoom: false,
      keyboard: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      attributionControl: true,
      wheelDebounceTime: 55,
      wheelPxPerZoomLevel: 105
    }).setView([31, 32], 2.25);

    tileLayer = createTileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      "&copy; OpenStreetMap contributors &copy; CARTO"
    );
    attachTileEvents(tileLayer);
    tileLayer.addTo(map);
    routeLayer = L.featureGroup().addTo(map);
    markerLayer = L.featureGroup().addTo(map);
    cityLayer = L.featureGroup().addTo(map);

    map.on("dragstart zoomstart", hideMapDestinationCard);
    map.on("moveend", () => { if (!firstTileReady) setMapLoader("mapLoading", true); });
    map.whenReady(() => {
      updateMap(true);
      scheduleMapStabilization();
      if (!mapHasFittedOnce) {
        mapHasFittedOnce = true;
        requestAnimationFrame(() => fitMap());
      }
    });

    let resizeTimer;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scheduleMapStabilization, 90);
      });
      resizeObserver.observe($("#map2d"));
      resizeObserver.observe($("#map"));
    }

    mapLoaderTimer = setTimeout(() => {
      if (!tileFallbackUsed && tileErrorCount > 0) switchToFallbackTiles();
      else hideMapLoader();
    }, 8500);
    return map;
  }

  function scheduleMapStabilization() {
    if (!map || currentMapMode !== "2d") return;
    cancelAnimationFrame(mapStabilizeFrame);
    clearTimeout(mapStabilizeTimer);

    mapStabilizeFrame = requestAnimationFrame(() => {
      mapStabilizeFrame = requestAnimationFrame(() => {
        try { map.invalidateSize({ pan:false, animate:false }); } catch (_) {}
      });
    });

    mapStabilizeTimer = setTimeout(() => {
      try { map.invalidateSize({ pan:false, animate:false }); } catch (_) {}
    }, 220);
  }

  function shortCountryName(country = "") {
    return String(country).split("·")[0].trim() || country;
  }

  function countryAbbreviation(country = "") {
    const key = shortCountryName(country).toLowerCase();
    const codes = { spain:"ES", austria:"AT", hungary:"HU", italy:"IT", france:"FR", greece:"GR" };
    return codes[key] || shortCountryName(country).replace(/[^A-Za-z]/g, "").slice(0,2).toUpperCase() || "•";
  }

  function makeCountryIcon(country, count) {
    return L.divIcon({
      className:"",
      html:`<div class="country-marker"><b>${escapeHTML(countryAbbreviation(country))}</b><span>${count}</span></div>`,
      iconSize:[46,46],
      iconAnchor:[23,23]
    });
  }

  function makeCityIcon(current = false) {
    return L.divIcon({
      className:"",
      html:`<div class="city-marker ${current ? "current-city" : ""}"></div>`,
      iconSize:[20,20],
      iconAnchor:[10,10]
    });
  }

  function getRouteSignature() {
    return JSON.stringify({
      language: state.language,
      routeTrips: state.routeTrips
    });
  }

  function hideMapDestinationCard() {
    const card = $("#mapDestinationCard");
    if (!card) return;
    card.classList.remove("open");
    card.setAttribute("aria-hidden", "true");
    currentMapDestinationId = "";
  }

  function showMapDestinationCard(stop) {
    if (!stop) return;
    currentMapDestinationId = stop.id;
    $("#mapDestinationMeta").textContent = `${stop.country || ""}${stop.current ? " · CURRENT" : ""}`;
    $("#mapDestinationTitle").textContent = stop.name;
    $("#mapDestinationStory").textContent = stop.note || stop.address || "真实旅途路线中的地点。";
    const card = $("#mapDestinationCard");
    card.classList.add("open");
    card.setAttribute("aria-hidden", "false");
  }

  function groupedCountries() {
    const groups = new Map();
    allMapPoints().forEach(stop => {
      const lat = Number(stop.lat);
      const lng = Number(stop.lng);
      if (stop.kind === "origin" || !stop.country || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (!groups.has(stop.country)) groups.set(stop.country, []);
      groups.get(stop.country).push({ ...stop, lat, lng });
    });
    return groups;
  }

  function showCountryDestinations(country, zoomToCountry = true) {
    if (!map || !cityLayer) return;
    activeCountry = country;
    cityLayer.clearLayers();
    hideMapDestinationCard();
    const items = (groupedCountries().get(country) || []);
    const bounds = [];
    items.forEach(stop => {
      const point = [Number(stop.lat), Number(stop.lng)];
      bounds.push(point);
      const marker = L.marker(point, { icon: makeCityIcon(Boolean(stop.current)), keyboard:true, title:stop.name });
      marker.on("click", () => showMapDestinationCard(stop));
      marker.bindTooltip(stop.name, { direction:"top", offset:[0,-8], opacity:.9 });
      marker.addTo(cityLayer);
    });
    if (!zoomToCountry || !bounds.length) return;
    if (bounds.length === 1) map.setView(bounds[0], 5.25, { animate:false });
    else map.fitBounds(bounds, { padding:[72,72], maxZoom:5.25, animate:false });
    scheduleMapStabilization();
  }

  function updateMap(force = false) {
    if (!map || !routeLayer || !markerLayer || !cityLayer) return;
    const signature = getRouteSignature();
    if (!force && signature === lastMapSignature) {
      updateGlobeData();
      return;
    }
    lastMapSignature = signature;
    routeLayer.clearLayers();
    markerLayer.clearLayers();
    cityLayer.clearLayers();

    groupedCountries().forEach((items, country) => {
      const centroid = items.reduce((acc, item) => [acc[0] + item.lat, acc[1] + item.lng], [0,0]).map(value => value / items.length);
      const marker = L.marker(centroid, { icon:makeCountryIcon(country, items.length), keyboard:true, title:country });
      marker.on("click", () => showCountryDestinations(country, true));
      marker.bindTooltip(country, { direction:"top", offset:[0,-20], opacity:.92 });
      marker.addTo(markerLayer);
    });

    state.routeTrips.forEach((trip, tripIndex) => {
      const coords = trip.stops
        .map(stop => [Number(stop.lat), Number(stop.lng)])
        .filter(coord => coord.every(Number.isFinite));
      if (coords.length < 2) return;
      const color = routeColor(tripIndex);
      L.polyline(coords, {
        renderer: map.options.renderer,
        color,
        weight: trip.current ? 3.4 : 2.2,
        opacity: trip.current ? .84 : .50,
        lineCap:"round",
        lineJoin:"round",
        interactive:false,
        dashArray: trip.current ? null : "3 4"
      }).addTo(routeLayer);
    });

    if (activeCountry && groupedCountries().has(activeCountry)) showCountryDestinations(activeCountry, false);
    updateGlobeData(true);
  }

  function footprintCoordinates() {
    return allMapPoints()
      .map(point => [Number(point.lat), Number(point.lng)])
      .filter(point => point.every(Number.isFinite));
  }

  function fitMap() {
    if (!map || currentMapMode !== "2d") return;
    activeCountry = "";
    cityLayer?.clearLayers();
    hideMapDestinationCard();
    const points = footprintCoordinates();
    if (!points.length) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      paddingTopLeft:[58,58],
      paddingBottomRight:[58,58],
      maxZoom:4.75,
      animate:true,
      duration:.7
    });
    scheduleMapStabilization();
  }

  function loadGlobeLibrary() {
    if (window.Globe) return Promise.resolve(window.Globe);
    if (globeInitPromise) return globeInitPromise;
    globeInitPromise = loadScriptOnce("https://cdn.jsdelivr.net/npm/globe.gl@2.46.1/dist/globe.gl.min.js", "Globe")
      .catch(async () => {
        return loadScriptOnce("https://unpkg.com/globe.gl@2.46.1/dist/globe.gl.min.js", "Globe");
      });
    return globeInitPromise;
  }

  function setGlobeStatus(message, visible = true, isError = false) {
    const status = $("#globeStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
    status.classList.toggle("hidden", !visible);
  }

  function preloadImage(url, timeout = 6000) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const timer = setTimeout(() => reject(new Error("image timeout")), timeout);
      image.onload = () => { clearTimeout(timer); resolve(url); };
      image.onerror = () => { clearTimeout(timer); reject(new Error("image failed")); };
      image.crossOrigin = "anonymous";
      image.src = url;
    });
  }

  function safelyPauseGlobe(hard = false) {
    if (!globe) return;
    try { globe.controls().autoRotate = false; } catch (_) {}
    if (hard) {
      try { globe.pauseAnimation?.(); } catch (_) {}
    }
  }

  function safelyResumeGlobe() {
    if (!globe || currentMapMode !== "3d" || !pageVisible) return;
    try { globe.resumeAnimation?.(); } catch (_) {}
    try {
      const controls = globe.controls();
      controls.enabled = true;
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      controls.autoRotateSpeed = .10;
    } catch (_) {}
  }


  function waitForPaint(frames = 2) {
    return new Promise(resolve => {
      const step = () => {
        if (frames <= 0) {
          resolve();
          return;
        }
        frames -= 1;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function isGlobeInstance(value) {
    return Boolean(
      value &&
      typeof value.backgroundColor === "function" &&
      typeof value.pointsData === "function" &&
      typeof value.pointOfView === "function"
    );
  }

  function createGlobeInstance(GlobeFactory, element) {
    const config = {
      animateIn: false,
      waitForGlobeReady: false,
      rendererConfig: {
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }
    };

    const attempts = [
      () => {
        const builder = GlobeFactory(config);
        return typeof builder === "function" ? builder(element) : builder;
      },
      () => new GlobeFactory(element, config),
      () => {
        const builder = GlobeFactory();
        return typeof builder === "function" ? builder(element) : builder;
      }
    ];

    const errors = [];
    for (const attempt of attempts) {
      try {
        const instance = attempt();
        if (isGlobeInstance(instance)) return instance;
      } catch (error) {
        errors.push(error);
      }
    }

    const reason = errors.at(-1);
    throw new TypeError(
      `Unable to create Globe.GL instance${reason?.message ? `: ${reason.message}` : ""}`
    );
  }

  function callGlobeMethod(instance, method, ...args) {
    if (typeof instance?.[method] === "function") instance[method](...args);
    return instance;
  }

  async function initGlobe() {
    if (globe) {
      resizeGlobe();
      updateGlobeData();
      safelyResumeGlobe();
      return globe;
    }

    const element = $("#globe3d");
    if (!element) return null;

    setGlobeStatus(t("globeLoading"), true, false);
    await waitForPaint(2);

    const GlobeFactory = await loadGlobeLibrary().catch(error => {
      console.error("Globe library failed to load", error);
      return null;
    });

    if (!GlobeFactory) {
      setGlobeStatus(t("mapUnavailable"), true, true);
      return null;
    }

    try {
      const instance = createGlobeInstance(GlobeFactory, element);
      globe = instance;

      callGlobeMethod(globe, "backgroundColor", "rgba(20,27,35,0)");
      callGlobeMethod(globe, "showGlobe", true);
      callGlobeMethod(globe, "showAtmosphere", true);
      callGlobeMethod(globe, "atmosphereColor", "#c2d0d1");
      callGlobeMethod(globe, "atmosphereAltitude", .14);
      callGlobeMethod(globe, "pointAltitude", .04);
      callGlobeMethod(globe, "pointRadius", .34);
      callGlobeMethod(globe, "pointResolution", 8);
      callGlobeMethod(
        globe,
        "pointColor",
        data => memoryPointColor(data)
      );
      callGlobeMethod(
        globe,
        "pointLabel",
        data => `<b>${escapeHTML(data.name)}</b><br>${escapeHTML(data.country || "")}`
      );
      callGlobeMethod(globe, "arcColor", data => [data.color, "rgba(255,255,255,.42)"]);
      callGlobeMethod(globe, "arcDashLength", .42);
      callGlobeMethod(globe, "arcDashGap", .80);
      callGlobeMethod(
        globe,
        "arcDashAnimateTime",
        matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 4400
      );
      callGlobeMethod(globe, "arcStroke", data => data.current ? .50 : .32);
      callGlobeMethod(globe, "arcCurveResolution", 24);
      callGlobeMethod(globe, "arcCircularResolution", 4);
      callGlobeMethod(globe, "onPointClick", data => {
        showMapDestinationCard(data);
      });
      callGlobeMethod(globe, "onGlobeReady", () => {
        setGlobeStatus(t("globeReady"), false, false);
        resizeGlobe();
      });

      try {
        const renderer = globe.renderer?.();
        renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));

        const material = globe.globeMaterial?.();
        if (material?.color?.set) material.color.set("#6f8793");
        if (material?.emissive?.set) {
          material.emissive.set("#18242b");
          material.emissiveIntensity = .24;
        }
        if (material && "shininess" in material) material.shininess = 2;
      } catch (error) {
        console.warn("Globe material configuration skipped", error);
      }

      const controls = globe.controls?.();
      if (controls) {
        controls.enabled = true;
        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = .065;
        controls.rotateSpeed = .42;
        controls.zoomSpeed = .68;
        controls.minDistance = 130;
        controls.maxDistance = 460;
        controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
        controls.autoRotateSpeed = .075;

        controls.addEventListener?.("start", () => {
          clearTimeout(globeResumeTimer);
          try { globe.resumeAnimation?.(); } catch (_) {}
          controls.autoRotate = false;
        });
        controls.addEventListener?.("end", () => {
          clearTimeout(globeResumeTimer);
          globeResumeTimer = setTimeout(safelyResumeGlobe, 2400);
        });
      }

      if (window.IntersectionObserver) {
        globeVisibilityObserver?.disconnect();
        globeVisibilityObserver = new IntersectionObserver(entries => {
          const visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > .01);
          if (visible && currentMapMode === "3d" && pageVisible) safelyResumeGlobe();
          else safelyPauseGlobe(false);
        }, { rootMargin:"120px 0px", threshold:[0,.01,.2] });
        globeVisibilityObserver.observe($("#map"));
      }

      resizeGlobe();
      updateGlobeData(true);
      callGlobeMethod(globe, "pointOfView", { lat:38, lng:32, altitude:1.95 }, 0);

      // Some Globe.GL builds invoke onGlobeReady later; keep a visible fallback timeout.
      setTimeout(() => {
        if (globe && currentMapMode === "3d") {
          setGlobeStatus(t("globeReady"), false, false);
          resizeGlobe();
        }
      }, 900);

      const textureCandidates = [
        "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
        "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      ];
      for (const textureUrl of textureCandidates) {
        try {
          await preloadImage(textureUrl, 5500);
          callGlobeMethod(globe, "globeImageUrl", textureUrl);
          break;
        } catch (_) {}
      }

      requestAnimationFrame(resizeGlobe);
      setTimeout(resizeGlobe, 180);
      return globe;
    } catch (error) {
      console.error("Globe initialization failed", error);
      try { globe?._destructor?.(); } catch (_) {}
      globe = null;
      element.querySelectorAll("canvas").forEach(canvas => canvas.remove());
      setGlobeStatus(t("mapUnavailable"), true, true);
      return null;
    }
  }

  function resizeGlobe() {
    if (!globe || currentMapMode !== "3d") return;
    const element = $("#globe3d");
    if (!element || !element.clientWidth || !element.clientHeight) return;
    try { globe.width(element.clientWidth).height(element.clientHeight); } catch (_) {}
  }

  function updateGlobeData(force = false) {
    if (!globe) return;
    const signature = getRouteSignature();
    if (!force && signature === lastGlobeSignature) return;
    lastGlobeSignature = signature;

    const points = allMapPoints().map(point => ({
      ...point,
      lat:Number(point.lat),
      lng:Number(point.lng),
      origin:point.kind === "origin",
      current:Boolean(point.current)
    }));
    const unique = [];
    const seen = new Set();
    points.forEach(point => {
      const key = `${point.placeKey || point.id}:${point.lat}:${point.lng}`;
      if (!seen.has(key)) { seen.add(key); unique.push(point); }
    });

    const arcs = [];
    state.routeTrips.forEach((trip, tripIndex) => {
      const color = routeColor(tripIndex);
      const tripPoints = trip.stops
        .map(stop => ({ lat:Number(stop.lat), lng:Number(stop.lng) }))
        .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng));
      for (let i=0; i<tripPoints.length-1; i += 1) {
        arcs.push({
          startLat:tripPoints[i].lat,
          startLng:tripPoints[i].lng,
          endLat:tripPoints[i+1].lat,
          endLng:tripPoints[i+1].lng,
          color,
          current:Boolean(trip.current)
        });
      }
    });
    globe.pointsData(unique).arcsData(arcs);
  }


  function circularMeanLongitude(points) {
    const vectors = points.map(([, lng]) => {
      const radians = lng * Math.PI / 180;
      return [Math.cos(radians), Math.sin(radians)];
    });
    const x = vectors.reduce((sum, value) => sum + value[0], 0);
    const y = vectors.reduce((sum, value) => sum + value[1], 0);
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  function fitGlobeToFootprints() {
    if (!globe) return;
    const points = footprintCoordinates();
    if (!points.length) return;
    const lat = points.reduce((sum, point) => sum + point[0], 0) / points.length;
    const lng = circularMeanLongitude(points);
    const spread = points.reduce((max, point) => {
      const dLat = Math.abs(point[0] - lat);
      let dLng = Math.abs(point[1] - lng);
      dLng = Math.min(dLng, 360 - dLng);
      return Math.max(max, Math.hypot(dLat, dLng * .75));
    }, 0);
    const altitude = Math.max(1.85, Math.min(3.25, 1.75 + spread / 62));
    globe.pointOfView({ lat, lng, altitude }, 900);
  }

  async function fitAllFootprints() {
    const button = $("#fitMapBtn");
    button?.classList.add("is-working");
    try {
      if (currentMapMode === "3d") {
        await initGlobe();
        fitGlobeToFootprints();
      } else {
        await initMap();
        fitMap();
      }
      if (button) {
        const original = button.textContent;
        button.textContent = t("fitDone");
        setTimeout(() => { button.textContent = t("fitFootprints"); }, 1500);
      }
    } finally {
      setTimeout(() => button?.classList.remove("is-working"), 350);
    }
  }

  async function setMapMode(mode) {
    const requestId = ++mapModeRequestId;
    const requested3d = mode === "3d";

    currentMapMode = requested3d ? "3d" : "2d";
    $("#map2d").classList.toggle("hidden", requested3d);
    $("#globe3d").classList.toggle("hidden", !requested3d);
    $("#map2dBtn").classList.toggle("active", !requested3d);
    $("#map3dBtn").classList.toggle("active", requested3d);
    $("#map2dBtn").setAttribute("aria-pressed", String(!requested3d));
    $("#map3dBtn").setAttribute("aria-pressed", String(requested3d));

    if (requested3d) {
      setGlobeStatus(t("globeLoading"), true, false);
      await waitForPaint(2);
      if (requestId !== mapModeRequestId) return;

      const instance = await initGlobe();
      if (requestId !== mapModeRequestId) return;

      if (!instance) {
        // Keep the 3D panel visible with a readable error instead of a silent black box.
        setGlobeStatus(t("mapUnavailable"), true, true);
        return;
      }

      resizeGlobe();
      updateGlobeData(true);
      safelyResumeGlobe();
      requestAnimationFrame(resizeGlobe);
      setTimeout(resizeGlobe, 180);
      return;
    }

    safelyPauseGlobe(true);
    await initMap();
    if (requestId !== mapModeRequestId) return;
    scheduleMapStabilization();
  }

  function initMapWhenNeeded() {
    const section = $("#map");
    if (!section) return;
    if (!window.IntersectionObserver) {
      setTimeout(initMap, 450);
      return;
    }
    mapIntersectionObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        initMap();
        mapIntersectionObserver.disconnect();
      }
    }, { rootMargin:"500px 0px", threshold:0.01 });
    mapIntersectionObserver.observe(section);
    setTimeout(() => { if (!map) initMap(); }, 9000);
  }

  function openTripDialog(id = "") {
    const item = id ? state.journalEntries.find(x => x.id === id) : null;
    $("#tripId").value = item?.id || ""; $("#tripName").value = item?.name || ""; $("#tripCountry").value = item?.country || ""; $("#tripStart").value = item?.start || ""; $("#tripEnd").value = item?.end || ""; $("#tripType").value = item?.type || "trip"; $("#tripColor").value = safeColor(item?.color || state.paperColor); $("#tripCoverUrl").value = item?.coverUrl || item?.coverImage || item?.imageUrl || ""; $("#tripLat").value = item?.lat ?? ""; $("#tripLng").value = item?.lng ?? ""; $("#tripStory").value = item?.story || ""; $("#tripMedia").value = "";
    $("#dialogTitle").textContent = item?.name || t("newDestination"); $("#deleteTrip").classList.toggle("hidden", !item); $("#geocodeStatus").textContent = t("coordinateHint"); renderExistingMedia(item); $("#tripDialog").showModal(); document.body.classList.add("modal-open");
  }
  async function renderExistingMedia(item) {
    const box = $("#existingMedia"); box.innerHTML = ""; if (!item?.media?.length) return;
    for (const meta of item.media) {
      const rec = await getMediaRecord(meta.id).catch(() => null); if (!rec) continue;
      const url = URL.createObjectURL(rec.blob); mediaUrls.push(url);
      const chip = document.createElement("div"); chip.className = "media-chip";
      const el = rec.type.startsWith("video/") ? document.createElement("video") : document.createElement("img"); el.src = url; if (el.tagName === "VIDEO") { el.muted = true; el.controls = true; }
      chip.appendChild(el); const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×";
      remove.addEventListener("click", async () => { await removeMediaRecord(meta.id); item.media = item.media.filter(m => m.id !== meta.id); saveState(); renderExistingMedia(item); }); chip.appendChild(remove); box.appendChild(chip);
    }
  }
  const closeTripDialog = () => { $("#tripDialog").close(); document.body.classList.remove("modal-open"); };
  async function submitTrip(event) {
    event.preventDefault(); const id = $("#tripId").value || crypto.randomUUID(); let item = state.journalEntries.find(x => x.id === id);
    if (!item) { item = { id, media:[] }; state.journalEntries.unshift(item); }
    Object.assign(item, { name: $("#tripName").value.trim(), country: $("#tripCountry").value.trim(), start: $("#tripStart").value, end: $("#tripEnd").value, type: $("#tripType").value, color: $("#tripColor").value, coverUrl: $("#tripCoverUrl").value.trim(), lat: $("#tripLat").value === "" ? null : Number($("#tripLat").value), lng: $("#tripLng").value === "" ? null : Number($("#tripLng").value), story: $("#tripStory").value.trim(), media: item.media || [] });
    const files = [...$("#tripMedia").files]; for (const file of files) { try { item.media.push(await saveMediaBlob(id, file)); } catch (err) { console.error("Media save failed", err); } }
    saveState(); closeTripDialog(); renderAll();
  }
  async function deleteCurrentTrip() {
    const id = $("#tripId").value; const item = state.journalEntries.find(x => x.id === id); if (!item) return; if (!confirm(`${t("deletePage")} — ${item.name}?`)) return;
    for (const media of item.media || []) await removeMediaRecord(media.id).catch(() => {});
    state.journalEntries = state.journalEntries.filter(x => x.id !== id); saveState(); closeTripDialog(); renderAll();
  }
  async function geocodeTrip() {
    const name = $("#tripName").value.trim(), country = $("#tripCountry").value.trim(); if (!name && !country) return; $("#geocodeStatus").textContent = "…";
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=${encodeURIComponent(state.language)}&q=${encodeURIComponent(name + " " + country)}`;
      const res = await fetch(url, { headers:{ "Accept":"application/json" } }); const data = await res.json(); if (!data[0]) throw new Error("not found");
      $("#tripLat").value = Number(data[0].lat).toFixed(6); $("#tripLng").value = Number(data[0].lon).toFixed(6); $("#geocodeStatus").textContent = `${t("located")}: ${data[0].display_name}`;
    } catch (_) { $("#geocodeStatus").textContent = t("locateFailed"); }
  }

  function initEditableText() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(EDITABLE_KEY) || "{}"); } catch (_) {}
    const currentChapterSentence = "如今，我已经从格拉纳达来到马德里实习，新的日常也正在这里继续展开。";
    if (saved.heroIntro && !String(saved.heroIntro).includes("马德里实习")) {
      saved.heroIntro = `${String(saved.heroIntro).trim()} ${currentChapterSentence}`;
      try { localStorage.setItem(EDITABLE_KEY, JSON.stringify(saved)); } catch (_) {}
    }
    $$('[data-edit-key]').forEach(el => {
      if (saved[el.dataset.editKey]) el.innerHTML = saved[el.dataset.editKey];
      el.addEventListener('blur', () => {
        saved[el.dataset.editKey] = el.innerHTML;
        try { localStorage.setItem(EDITABLE_KEY, JSON.stringify(saved)); } catch (_) {}
      });
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey && el.tagName !== 'P') {
          event.preventDefault();
          el.blur();
        }
      });
    });
  }

  function initLoader() {
    const bar = $("#pixelBar"); for (let i=0; i<40; i++) bar.appendChild(document.createElement("i")); const cells = $$("i", bar);
    const messages = ["mixing moonlight into the water…","blending pastel clouds over the sea…","drawing routes with a silver thread…","warming the windows of remembered streets…","letting the stars find their places…"];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches; const duration = reduced ? 1200 : 10000; const start = performance.now();
    const tick = now => { const p = Math.min(1, (now - start) / duration); const eased = 1 - Math.pow(1 - p, 2.1); const percent = Math.floor(eased * 100); $("#loaderProgress").textContent = `${percent}%`; $("#loaderMessage").textContent = messages[Math.min(messages.length-1, Math.floor(p * messages.length))]; cells.forEach((cell, idx) => cell.classList.toggle("on", idx < Math.floor(eased * cells.length))); if (p < 1) requestAnimationFrame(tick); else { $("#loaderProgress").textContent = "100%"; setTimeout(() => $("#loader").classList.add("done"), 350); } };
    requestAnimationFrame(tick);
  }

  function createPainting(canvas) {
    const ctx = canvas.getContext("2d", { alpha:false });
    let w = 0;
    let h = 0;
    let dpr = 1;
    let scene = "water";
    let custom = "";
    let baseLayer;
    let cloudLayer;
    let waterLayer;
    let lightLayer;
    let customImage = null;
    let lastFrame = 0;
    let scrollIdleTimer;
    let isScrolling = false;
    const targetFrameMs = 1000 / 24;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const palettes = {
      water: {
        sky:["#8ea6b9","#cbb9b9","#e0d7c5","#d8cfca"],
        water:["#6f9198","#94a3a7","#8d7f92","#708790"],
        glow:"#efe4d0", mist:"#d8d0cb"
      },
      moon: {
        sky:["#5e6d8d","#7b7595","#abb5c1","#b9b5c1"],
        water:["#456372","#6c8195","#7a6f8c","#536a7b"],
        glow:"#e8edf5", mist:"#a8a8bb"
      },
      rose: {
        sky:["#d0a9b1","#d9c8bd","#b3bcb7","#d8c4c3"],
        water:["#899ea0","#b1949f","#968378","#88928f"],
        glow:"#f8dfcf", mist:"#d9c2c2"
      },
      gold: {
        sky:["#b5b08c","#d9c39c","#c8d3cc","#d8cfb7"],
        water:["#738e8d","#8c8266","#9d746c","#778985"],
        glow:"#f7dda2", mist:"#d7c8aa"
      },
      ocean: {
        sky:["#efb4ba","#d8c8e2","#b6cdd6","#e3cbd4"],
        water:["#6ba2b2","#7ca7b8","#9d9bba","#7796a9"],
        glow:"#ffe6b6", mist:"#d4c9da"
      },
      violet: {
        sky:["#7d7ea4","#9c8ab0","#b5c0cf","#aaa7c0"],
        water:["#536f89","#7585a3","#9a88aa","#63778e"],
        glow:"#f1e8fd", mist:"#aba4bd"
      },
      lavender: {
        sky:["#d8bdcf","#c9badb","#b9c8d9","#e3d6dd"],
        water:["#858ba4","#a195b0","#b19da9","#8399a5"],
        glow:"#f9e9f4", mist:"#d5c7d8"
      },
      creamrose: {
        sky:["#eee2d0","#e2cdc6","#d7bdc1","#ead8ca"],
        water:["#a49d95","#b49a9a","#b4a89e","#8e9792"],
        glow:"#fff1d8", mist:"#e4d1c8"
      }
    };

    function makeLayer() {
      const layer = document.createElement("canvas");
      layer.width = Math.max(1, Math.round(w * dpr));
      layer.height = Math.max(1, Math.round(h * dpr));
      const layerCtx = layer.getContext("2d");
      layerCtx.setTransform(dpr,0,0,dpr,0,0);
      return { canvas:layer, ctx:layerCtx };
    }

    function colorWithAlpha(color, alpha) {
      return color + Math.round(Math.max(0, Math.min(1, alpha)) * 255)
        .toString(16)
        .padStart(2, "0");
    }

    function paintSoftBlob(o, x, y, rx, ry, color, alpha=.24) {
      o.save();
      o.translate(x,y);
      o.rotate((Math.random()-.5)*.45);
      o.scale(rx,ry);
      const gradient = o.createRadialGradient(0,0,.08,0,0,1);
      gradient.addColorStop(0, colorWithAlpha(color, alpha));
      gradient.addColorStop(.68, colorWithAlpha(color, alpha*.56));
      gradient.addColorStop(1, color + "00");
      o.fillStyle = gradient;
      o.beginPath();
      o.arc(0,0,1,0,Math.PI*2);
      o.fill();
      o.restore();
    }

    function paintStroke(o, x, y, length, thickness, angle, color, alpha=.24) {
      o.save();
      o.translate(x,y);
      o.rotate(angle);
      const gradient = o.createLinearGradient(-length/2,0,length/2,0);
      gradient.addColorStop(0,color+"00");
      gradient.addColorStop(.18,colorWithAlpha(color, alpha*.63));
      gradient.addColorStop(.82,colorWithAlpha(color, alpha*.75));
      gradient.addColorStop(1,color+"00");
      o.fillStyle = gradient;
      o.beginPath();
      o.moveTo(-length/2,0);
      o.quadraticCurveTo(-length*.15,-thickness*.55,length/2,-thickness*.05);
      o.quadraticCurveTo(length*.18,thickness*.5,-length/2,0);
      o.fill();
      o.restore();
    }

    function buildTexture() {
      const p = palettes[scene];
      baseLayer = makeLayer();
      cloudLayer = makeLayer();
      waterLayer = makeLayer();
      lightLayer = makeLayer();

      const base = baseLayer.ctx;
      const clouds = cloudLayer.ctx;
      const water = waterLayer.ctx;
      const light = lightLayer.ctx;
      const horizon = h * .50;

      const atmosphere = base.createLinearGradient(0,0,0,h);
      atmosphere.addColorStop(0, p.sky[0]);
      atmosphere.addColorStop(.18, p.sky[1]);
      atmosphere.addColorStop(.34, p.sky[2]);
      atmosphere.addColorStop(.48, p.sky[3]);
      atmosphere.addColorStop(.58, p.water[1]);
      atmosphere.addColorStop(.72, p.water[0]);
      atmosphere.addColorStop(.86, p.water[2]);
      atmosphere.addColorStop(1, p.water[3]);
      base.fillStyle = atmosphere;
      base.fillRect(0,0,w,h);

      const horizonMist = base.createLinearGradient(0,h*.28,0,h*.72);
      horizonMist.addColorStop(0, p.mist+"00");
      horizonMist.addColorStop(.28, p.mist+"36");
      horizonMist.addColorStop(.50, p.mist+"9b");
      horizonMist.addColorStop(.72, p.mist+"42");
      horizonMist.addColorStop(1, p.mist+"00");
      base.fillStyle = horizonMist;
      base.fillRect(0,h*.25,w,h*.52);

      for (let i=0;i<24;i+=1) {
        const y = h * (.08 + Math.random()*.82);
        const colors = y > horizon ? p.water : p.sky;
        paintSoftBlob(
          base,
          Math.random()*w,
          y,
          100+Math.random()*280,
          55+Math.random()*165,
          colors[Math.floor(Math.random()*colors.length)],
          .13+Math.random()*.13
        );
      }

      const strokeCount = Math.max(110, Math.floor(w*h/4900));
      for (let i=0;i<strokeCount;i+=1) {
        const y = Math.random()*h;
        const waterWeight = Math.max(0, Math.min(1, (y-h*.34)/(h*.42)));
        const colors = Math.random() < waterWeight ? p.water : p.sky;
        paintStroke(
          base,
          Math.random()*w,
          y,
          20+Math.random()*(waterWeight ? 92 : 76),
          2+Math.random()*(waterWeight ? 7 : 13),
          (Math.random()-.5)*(waterWeight ? .10 : .30),
          colors[Math.floor(Math.random()*colors.length)],
          .10+Math.random()*.17
        );
      }

      for (let i=0;i<10;i+=1) {
        paintSoftBlob(
          clouds,
          w*(.06+i*.105)+Math.random()*70,
          h*(.12+Math.random()*.29),
          140+Math.random()*205,
          48+Math.random()*96,
          p.sky[(i+1)%p.sky.length],
          .09+Math.random()*.075
        );
      }

      for (let i=0;i<110;i+=1) {
        const y = h*.46 + Math.random()*h*.54;
        paintStroke(
          water,
          Math.random()*w,
          y,
          30+Math.random()*105,
          1+Math.random()*5,
          (Math.random()-.5)*.07,
          Math.random()>.68 ? p.glow : p.water[Math.floor(Math.random()*p.water.length)],
          .075+Math.random()*.15
        );
      }

      const lightX = w*.55;
      const lightY = h*.31;
      const glow = light.createRadialGradient(
        lightX,lightY,0,
        lightX,lightY,Math.min(w,h)*.44
      );
      glow.addColorStop(0,p.glow+"c2");
      glow.addColorStop(.18,p.glow+"58");
      glow.addColorStop(.46,p.glow+"18");
      glow.addColorStop(1,"transparent");
      light.fillStyle = glow;
      light.fillRect(0,0,w,h);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w*dpr);
      canvas.height = Math.round(h*dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      buildTexture();
    }

    function drawCustom() {
      if (!customImage?.complete) return false;
      const scale = Math.max(w/customImage.width,h/customImage.height);
      const iw = customImage.width*scale;
      const ih = customImage.height*scale;
      ctx.drawImage(customImage,(w-iw)/2,(h-ih)/2,iw,ih);
      ctx.fillStyle = "rgba(20,23,28,.16)";
      ctx.fillRect(0,0,w,h);
      return true;
    }

    function draw(now) {
      requestAnimationFrame(draw);
      const frameBudget = isScrolling ? 110 : targetFrameMs;
      if (!pageVisible || now-lastFrame < frameBudget) return;
      lastFrame = now;

      ctx.clearRect(0,0,w,h);
      if (custom && drawCustom()) return;
      if (!baseLayer) return;

      ctx.drawImage(baseLayer.canvas,0,0,w,h);

      if (reducedMotion) {
        ctx.globalAlpha = .56;
        ctx.drawImage(cloudLayer.canvas,0,0,w,h);
        ctx.globalAlpha = .70;
        ctx.drawImage(waterLayer.canvas,0,0,w,h);
        ctx.globalAlpha = .46;
        ctx.drawImage(lightLayer.canvas,0,0,w,h);
        ctx.globalAlpha = 1;
        return;
      }

      const cloudDrift = Math.sin(now/42000)*7;
      const cloudLift = Math.cos(now/51000)*2.5;
      const waterDrift = Math.sin(now/30000)*3.5;
      const lightBreath = .40 + (Math.sin(now/24000)+1)*.045;

      ctx.globalAlpha = .52;
      ctx.drawImage(cloudLayer.canvas,cloudDrift-8,cloudLift,w+16,h);
      ctx.globalAlpha = .68;
      ctx.drawImage(waterLayer.canvas,waterDrift-5,0,w+10,h);
      ctx.globalAlpha = lightBreath;
      ctx.drawImage(lightLayer.canvas,0,0,w,h);
      ctx.globalAlpha = 1;
    }

    function setScene(next,bg="") {
      scene = next in palettes ? next : "water";
      custom = bg || "";
      customImage = null;
      if (custom) {
        customImage = new Image();
        customImage.onload = () => {};
        customImage.src = custom;
      }
      buildTexture();
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize,180);
    }, { passive:true });

    window.addEventListener("scroll", () => {
      isScrolling = true;
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => { isScrolling = false; }, 150);
    }, { passive:true });

    resize();
    requestAnimationFrame(draw);
    return { setScene };
  }


  function sanitizeTrack(track) { return { id: track.id || crypto.randomUUID(), name: track.name || "Untitled track", artist: track.artist || "", url: track.url || "", source: track.source || "url" }; }
  function setMusicTitle(text) {
    const title = text || "旅途留声机";
    const full = $("#musicTitle");
    const mini = $("#musicMiniTitle");
    if (full) full.textContent = title;
    if (mini) mini.textContent = title;
  }
  function setMusicDockOpen(open) {
    const dock = $("#musicDock");
    const popover = $("#musicPopover");
    const toggle = $("#togglePlaylist");
    if (!dock || !popover || !toggle) return;
    dock.classList.toggle("open", open);
    popover.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
  }
  function renderPlaylist() {
    const list = $("#playlistList"); if (!list) return; list.innerHTML = "";
    if (!state.musicTracks.length) { const p = document.createElement("p"); p.className = "mini-note"; p.textContent = "还没有歌曲，导入本地音频或添加一个可播放链接即可。"; list.appendChild(p); setMusicTitle("旅途留声机"); return; }
    state.musicTracks.forEach((track, index) => {
      const item = document.createElement("div"); item.className = "playlist-item" + (playerState.currentIndex === index ? " active" : "");
      item.innerHTML = `<div><strong>${escapeHTML(track.name)}</strong><small>${escapeHTML(track.artist || (track.source === 'local' ? 'local file' : 'custom link'))}</small></div><button type="button" data-play="${index}">▶</button><button type="button" data-remove="${index}">×</button>`;
      item.querySelector('[data-play]').addEventListener('click', () => playTrack(index));
      item.querySelector('[data-remove]').addEventListener('click', () => removeTrack(index));
      list.appendChild(item);
    });
  }
  function removeTrack(index) { const removed = state.musicTracks.splice(index,1)[0]; saveState(); if (playerState.currentIndex === index) { const audio = $("#audioPlayer"); audio.pause(); audio.removeAttribute('src'); playerState.currentIndex = -1; setMusicTitle('旅途留声机'); } if (playerState.currentIndex > index) playerState.currentIndex -= 1; renderPlaylist(); }
  function updatePlayerTime() { const audio = $("#audioPlayer"); const current = audio.currentTime || 0; const duration = audio.duration || 0; const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`; $("#musicTime").textContent = `${fmt(current)} / ${duration ? fmt(duration) : '00:00'}`; $("#musicProgress").value = duration ? (current/duration)*100 : 0; }
  function playTrack(index) {
    const audio = $("#audioPlayer"); const track = state.musicTracks[index]; if (!track) return; playerState.currentIndex = index; audio.src = track.url; audio.play().catch(()=>{}); setMusicTitle(track.name + (track.artist ? ` · ${track.artist}` : "")); $("#playPause").textContent = '❚❚'; renderPlaylist();
  }
  function togglePlayPause() { const audio = $("#audioPlayer"); if (!audio.src && state.musicTracks.length) return playTrack(Math.max(0, playerState.currentIndex)); if (audio.paused) { audio.play().catch(()=>{}); $("#playPause").textContent = '❚❚'; } else { audio.pause(); $("#playPause").textContent = '▶'; } }
  function nextTrack() { if (!state.musicTracks.length) return; const next = playerState.currentIndex < 0 ? 0 : (playerState.currentIndex + 1) % state.musicTracks.length; playTrack(next); }
  function prevTrack() { if (!state.musicTracks.length) return; const prev = playerState.currentIndex <= 0 ? state.musicTracks.length - 1 : playerState.currentIndex - 1; playTrack(prev); }
  function addMusicUrlTrack() { const name = $("#musicNameInput").value.trim(); const url = $("#musicUrlInput").value.trim(); if (!url) return; state.musicTracks.push(sanitizeTrack({ name: name || 'Custom track', url, source:'url' })); saveState(); $("#musicNameInput").value = ''; $("#musicUrlInput").value = ''; renderPlaylist(); }
  function addLocalMusic(files) { if (!files?.length) return; for (const file of files) { const url = URL.createObjectURL(file); playerState.objectUrls.push(url); state.musicTracks.push(sanitizeTrack({ name: file.name.replace(/\.[^.]+$/, ''), url, source:'local' })); } saveState(); renderPlaylist(); }


  function createSessionRandom(storageKey) {
    let seed = 0;
    try {
      seed = Number(sessionStorage.getItem(storageKey));
    } catch (_) {
      seed = 0;
    }

    if (!Number.isFinite(seed) || seed <= 0) {
      seed = Math.floor(Math.random() * 2147483646) + 1;
      try { sessionStorage.setItem(storageKey, String(seed)); } catch (_) {}
    }

    return () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function initPaintAtmosphere() {
    const starHost = $("#twinkleStars");
    const glintHost = $("#waterGlints");
    if (!starHost || !glintHost) return;

    const random = createSessionRandom("travelReverieAtmosphereSeedV1");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = innerWidth < 760;

    starHost.innerHTML = "";
    glintHost.innerHTML = "";

    const starCount = narrow ? 15 : 21;
    let created = 0;
    let attempts = 0;

    while (created < starCount && attempts < starCount * 12) {
      attempts += 1;
      const x = 3 + random() * 94;
      const y = 5 + random() * 77;

      const insideGlow = x > 42 && x < 68 && y > 25 && y < 66;
      if (insideGlow) continue;

      const star = document.createElement("i");
      star.className = "twinkle-star" + (random() > .76 ? " is-cross" : "");

      const sizeRoll = random();
      const size = sizeRoll > .93 ? 3 : sizeRoll > .58 ? 2 : 1;
      const duration = (2 + random() * 4).toFixed(2);
      const delay = (random() * 6).toFixed(2);
      const maxOpacity = (.6 + random() * .4).toFixed(2);

      star.style.left = `${x.toFixed(2)}%`;
      star.style.top = `${y.toFixed(2)}%`;
      star.style.setProperty("--star-size", `${size}px`);
      star.style.setProperty("--star-duration", reducedMotion ? "0s" : `${duration}s`);
      star.style.setProperty("--star-delay", `${delay}s`);
      star.style.setProperty("--star-max-opacity", maxOpacity);
      star.style.setProperty("--star-mid-opacity", (Number(maxOpacity) * .62).toFixed(2));
      starHost.appendChild(star);
      created += 1;
    }

    for (let index = 0; index < 7; index += 1) {
      const glint = document.createElement("i");
      glint.className = "water-glint";

      const width = 20 + random() * 74;
      const height = 2 + random() * 4.5;
      const duration = 3 + random() * 6;
      const delay = random() * 6;

      glint.style.left = `${(34 + random() * 40).toFixed(2)}%`;
      glint.style.top = `${(8 + random() * 72).toFixed(2)}%`;
      glint.style.setProperty("--glint-width", `${width.toFixed(1)}px`);
      glint.style.setProperty("--glint-height", `${height.toFixed(1)}px`);
      glint.style.setProperty("--glint-duration", reducedMotion ? "0s" : `${duration.toFixed(2)}s`);
      glint.style.setProperty("--glint-delay", `${delay.toFixed(2)}s`);
      glintHost.appendChild(glint);
    }
  }

  function bindEvents() {
    $("#languageSelect").addEventListener("change", e => { state.language = e.target.value; saveState(); applyI18n(); });
    $("#memoryStyleSelect").addEventListener("change", event => {
      applyMemoryStyle(event.target.value, { persist:true, rerender:true });
    });
    $("#themeToggle").addEventListener("click", () => { $("#themePanel").classList.add("open"); $("#themePanel").setAttribute("aria-hidden","false"); });
    $("#closeTheme").addEventListener("click", () => { $("#themePanel").classList.remove("open"); $("#themePanel").setAttribute("aria-hidden","true"); });
    $("#sceneSelect").addEventListener("change", e => { state.scene=e.target.value; state.customBackground=""; saveState(); applyTheme(); });
    $("#fontSelect").addEventListener("change", e => {
      state.font=normalizeFontChoice(e.target.value);
      saveState();
      applyTheme();
    });
    [["titleColor","titleColor"],["inkColor","inkColor"],["accentColor","accentColor"],["paperColor","paperColor"]].forEach(([id,key]) => {
      $("#"+id).addEventListener("input", e => {
        if (e.target.disabled) return;
        state[key]=e.target.value;
        saveState();
        applyTheme();
      });
    });
    $("#backgroundUpload").addEventListener("change", e => { const file=e.target.files[0]; if (!file) return; if (file.size > 4*1024*1024) { alert(t("backgroundHint")); return; } const reader=new FileReader(); reader.onload=()=>{ state.customBackground=reader.result; saveState(); applyTheme(); }; reader.readAsDataURL(file); });
    const randomScene = () => { const scenes=["water","moon","rose","gold","ocean","violet","lavender","creamrose"].filter(x => x!==state.scene); state.scene=scenes[Math.floor(Math.random()*scenes.length)]; state.customBackground=""; saveState(); applyTheme(); };
    $("#randomizeTheme").addEventListener("click", randomScene); $("#surpriseMe").addEventListener("click", randomScene);
    $("#resetTheme").addEventListener("click", () => {
      const keep = state.journalEntries;
      const origin = state.origin;
      const language = state.language;
      const routes = state.routeTrips;
      const musicTracks = state.musicTracks;
      const memoryStyle = state.memoryStyle;
      state = {
        ...structuredClone(defaultState),
        journalEntries:keep,
        origin,
        language,
        routeTrips:routes,
        musicTracks,
        memoryStyle
      };
      saveState();
      applyMemoryStyle(memoryStyle, { persist:false, rerender:false });
      applyI18n();
    });
    ["addTripTop","addTripBottom","addTripClosing"].forEach(id => $("#"+id).addEventListener("click", () => openTripDialog()));
    $("#closeDialog").addEventListener("click", closeTripDialog); $("#cancelTrip").addEventListener("click", closeTripDialog); $("#tripForm").addEventListener("submit", submitTrip); $("#deleteTrip").addEventListener("click", deleteCurrentTrip); $("#geocodeBtn").addEventListener("click", geocodeTrip);
    $("#newRouteTrip").addEventListener("click", () => openRouteDialog());
    $("#closeRouteDialog").addEventListener("click", closeRouteDialog);
    $("#cancelRouteDialog").addEventListener("click", closeRouteDialog);
    $("#routeForm").addEventListener("submit", submitRouteTrip);
    $("#deleteRouteTrip").addEventListener("click", deleteRouteTrip);
    $("#newRouteStop").addEventListener("click", startNewRouteStop);
    $("#saveRouteStop").addEventListener("click", () => saveActiveRouteStop());
    $("#deleteRouteStop").addEventListener("click", deleteActiveRouteStop);
    $("#routeGeocodeBtn").addEventListener("click", geocodeRouteStop);
    $("#searchInput").addEventListener("input", renderJournal); $("#countryFilter").addEventListener("change", renderJournal); $("#typeFilter").addEventListener("change", renderJournal);
    $("#map2dBtn").addEventListener("click", () => setMapMode("2d"));
    $("#map3dBtn").addEventListener("click", () => setMapMode("3d"));
    $("#routeToggle").addEventListener("click", () => {
      routeExpanded = !routeExpanded;
      renderRouteTimeline();
    });
    $("#fitMapBtn").addEventListener("click", fitAllFootprints);
    $("#tripDialog").addEventListener("click", e => { const rect=$("#tripDialog").getBoundingClientRect(); if (e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom) closeTripDialog(); });
    $("#routeDialog").addEventListener("click", e => { const rect=$("#routeDialog").getBoundingClientRect(); if (e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom) closeRouteDialog(); });
    $("#closeMapDestinationCard").addEventListener("click", hideMapDestinationCard);

    const audio = $("#audioPlayer");
    $("#playPause").addEventListener("click", togglePlayPause);
    $("#nextTrack").addEventListener("click", nextTrack);
    $("#prevTrack").addEventListener("click", prevTrack);
    $("#musicFiles").addEventListener("change", event => addLocalMusic([...event.target.files]));
    $("#addMusicUrl").addEventListener("click", addMusicUrlTrack);
    $("#musicProgress").addEventListener("input", event => { if (audio.duration) audio.currentTime = audio.duration * (Number(event.target.value)/100); });
    $("#musicVolume").addEventListener("input", event => audio.volume = Number(event.target.value));
    audio.volume = Number($("#musicVolume").value);
    audio.addEventListener("timeupdate", updatePlayerTime);
    audio.addEventListener("loadedmetadata", updatePlayerTime);
    audio.addEventListener("ended", nextTrack);
    audio.addEventListener("pause", () => { $("#playPause").textContent = "▶"; $("#musicDock").classList.remove("is-playing"); });
    audio.addEventListener("play", () => { $("#playPause").textContent = "❚❚"; $("#musicDock").classList.add("is-playing"); });
    $("#togglePlaylist").addEventListener("click", () => setMusicDockOpen(!$("#musicDock").classList.contains("open")));
    $("#closeMusicDock").addEventListener("click", () => setMusicDockOpen(false));
    document.addEventListener("pointerdown", event => {
      const dock = $("#musicDock");
      if (dock?.classList.contains("open") && !dock.contains(event.target)) setMusicDockOpen(false);
    }, { passive:true });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        setMusicDockOpen(false);
        hideMapDestinationCard();
      }
    });
    addEventListener("resize", () => {
      if (currentMapMode === "2d") scheduleMapStabilization();
      else resizeGlobe();
    });
    document.addEventListener("visibilitychange", () => {
      pageVisible = !document.hidden;
      if (pageVisible && currentMapMode === "3d") safelyResumeGlobe();
      else safelyPauseGlobe(true);
    });
  }

  function initCornerSketches() {
    const allSketches = $$(".corner-sketch");
    if (!allSketches.length) return;

    const random = createSessionRandom("travelReverieEditorialDoodleSeedV1");
    const variantChoice = new Map();

    $$("[data-variant-group]").forEach(sketch => {
      const group = sketch.dataset.variantGroup;
      if (!variantChoice.has(group)) {
        const groupItems = $$(`[data-variant-group="${group}"]`);
        variantChoice.set(group, Math.floor(random() * groupItems.length));
      }
    });

    const policies = {
      oil: {
        hero:["hero-moon-trail", "hero-wing-blue"],
        journal:["journal-flower", "journal-merci"],
        map:["map-heart"],
        archive:["archive-butterfly"],
        closing:["closing-gracias", "closing-rose"]
      },
      y2k: {
        hero:["hero-moon-trail", "hero-life-note"],
        journal:["journal-flower", "journal-ribbon"],
        map:["map-heart", "map-pink-feather"],
        archive:["archive-butterfly", "archive-pink-bow"],
        closing:["closing-gracias", "closing-bunny"]
      },
      film: {
        hero:["hero-moon-trail"],
        journal:["journal-merci"],
        map:["map-heart"],
        archive:["archive-butterfly"],
        closing:["closing-rose"]
      },
      sketchbook: {
        hero:["hero-wing-line", "hero-life-note"],
        journal:["journal-flower", "journal-cat"],
        map:["map-ocean-note", "map-pink-feather"],
        archive:["archive-friend", "archive-stars"],
        closing:["closing-gracias"]
      },
      watercolor: {
        hero:["hero-wing-blue", "hero-moon-trail"],
        journal:["journal-flower"],
        map:["map-ocean-note"],
        archive:["archive-butterfly"],
        closing:["closing-rose", "closing-gracias"]
      }
    };

    function layerName(layer) {
      if (layer.classList.contains("hero-corner-sketches")) return "hero";
      if (layer.closest("#journal")) return "journal";
      if (layer.closest("#map")) return "map";
      if (layer.closest("#archive")) return "archive";
      return "closing";
    }

    function sketchName(sketch) {
      return [...sketch.classList].find(name =>
        /^(hero|journal|map|archive|closing)-/.test(name)
      ) || "";
    }

    function isSelectedVariant(sketch) {
      const group = sketch.dataset.variantGroup;
      if (!group) return true;
      const items = $$(`[data-variant-group="${group}"]`);
      return items.indexOf(sketch) === variantChoice.get(group);
    }

    function sectionBudget(sectionName, section) {
      const styleBudgets = {
        oil:{ hero:2, journal:1, map:1, archive:1, closing:2 },
        y2k:{ hero:2, journal:2, map:2, archive:2, closing:2 },
        film:{ hero:1, journal:1, map:1, archive:1, closing:1 },
        sketchbook:{ hero:2, journal:2, map:2, archive:2, closing:1 },
        watercolor:{ hero:2, journal:1, map:1, archive:1, closing:2 }
      };
      const base = styleBudgets[state.memoryStyle]?.[sectionName] || 1;

      if (sectionName === "journal" && section.querySelectorAll(".trip-card").length >= 8) {
        return Math.min(base, 1);
      }
      if (sectionName === "archive" && section.querySelectorAll(".archive-card").length >= 8) {
        return Math.min(base, 1);
      }
      return base;
    }

    function activateSketch(sketch) {
      sketch.classList.remove("editorial-hidden", "is-placement-hidden");
      sketch.classList.add("editorial-active");

      if (!sketch.getAttribute("src")) {
        const source = sketch.dataset.src;
        if (source) sketch.src = source;
      }

      if (!sketch.dataset.editorialPrepared) {
        const baseScale = .88 + random() * .24;
        const angle = (random() - .5) * 12;

        sketch.dataset.baseScale = baseScale.toFixed(4);
        sketch.dataset.angle = angle.toFixed(4);
        sketch.style.setProperty("--doodle-x", "0px");
        sketch.style.setProperty("--doodle-y", "0px");
        sketch.style.setProperty("--doodle-rotate", `${angle.toFixed(2)}deg`);
        sketch.style.setProperty("--doodle-scale", baseScale.toFixed(3));
        sketch.dataset.editorialPrepared = "true";
      }

      const reveal = () => {
        requestAnimationFrame(() => {
          sketch.classList.add("is-ready");
          schedulePlacement();
        });
      };

      if (sketch.complete && sketch.naturalWidth > 0) reveal();
      else {
        sketch.addEventListener("load", reveal, { once:true });
        sketch.addEventListener("error", () => {
          sketch.classList.add("editorial-hidden");
        }, { once:true });
      }
    }

    function deactivateSketch(sketch) {
      sketch.classList.remove("editorial-active", "is-ready");
      sketch.classList.add("editorial-hidden");
      sketch.removeAttribute("src");
      delete sketch.dataset.whitespacePlaced;
    }

    function applyPolicy() {
      const style = MEMORY_STYLE_IDS.includes(state.memoryStyle) ? state.memoryStyle : "oil";

      $$(".corner-sketch-layer").forEach(layer => {
        const sectionName = layerName(layer);
        const section = layer.parentElement;
        const preferred = policies[style][sectionName] || [];
        const budget = sectionBudget(sectionName, section);

        const candidates = $$(".corner-sketch", layer)
          .filter(isSelectedVariant)
          .sort((a, b) => {
            const aRank = preferred.indexOf(sketchName(a));
            const bRank = preferred.indexOf(sketchName(b));
            return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
          });

        const activeNames = new Set(preferred.slice(0, budget));
        candidates.forEach(sketch => {
          if (activeNames.has(sketchName(sketch))) activateSketch(sketch);
          else deactivateSketch(sketch);
        });

        $$(".corner-sketch", layer)
          .filter(sketch => !isSelectedVariant(sketch))
          .forEach(deactivateSketch);
      });

      schedulePlacement();
    }

    const overlaps = (a, b, padding = 0) => !(
      a.right + padding <= b.left ||
      a.left >= b.right + padding ||
      a.bottom + padding <= b.top ||
      a.top >= b.bottom + padding
    );

    function relativeRect(rect, parentRect, padding = 0) {
      return {
        left:rect.left - parentRect.left - padding,
        top:rect.top - parentRect.top - padding,
        right:rect.right - parentRect.left + padding,
        bottom:rect.bottom - parentRect.top + padding
      };
    }

    function transformedGeometry(item, fitScale = 1) {
      const baseScale = Number(item.dataset.baseScale) || 1;
      const scale = baseScale * fitScale;
      const angle = (Number(item.dataset.angle) || 0) * Math.PI / 180;
      const rawWidth = Math.max(1, item.offsetWidth);
      const rawHeight = Math.max(1, item.offsetHeight);
      const scaledWidth = rawWidth * scale;
      const scaledHeight = rawHeight * scale;
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      const visualWidth = scaledWidth * cos + scaledHeight * sin;
      const visualHeight = scaledWidth * sin + scaledHeight * cos;

      return {
        scale,
        visualWidth,
        visualHeight,
        visualInsetX:(visualWidth - rawWidth) / 2,
        visualInsetY:(visualHeight - rawHeight) / 2
      };
    }

    function collectProtectedRects(section, layerRect, padding) {
      const selectors = [
        ".topbar",
        ".hero-copy",
        ".hero-card",
        ".scroll-cue",
        ".section-heading",
        ".trip-card",
        ".add-card",
        ".map-frame",
        ".route-sidebar",
        ".archive-card",
        ".closing > p",
        ".closing > h2",
        ".closing > button",
        ".music-sticker"
      ];

      const elements = [];
      selectors.forEach(selector => {
        const scope = selector === ".topbar" || selector === ".music-sticker"
          ? document
          : section;
        $$(selector, scope).forEach(element => {
          if (element.offsetParent !== null && !elements.includes(element)) {
            elements.push(element);
          }
        });
      });

      return elements
        .map(element => relativeRect(element.getBoundingClientRect(), layerRect, padding))
        .filter(rect => rect.right > 0 && rect.bottom > 0);
    }

    function anchorCandidates(section, layerRect, width, height, itemWidth, itemHeight, margin) {
      const result = [];
      const add = (left, top, weight = 0) => result.push({ left, top, weight });

      add(margin, margin, 0);
      add(width-itemWidth-margin, margin, 0);
      add(margin, height-itemHeight-margin, 0);
      add(width-itemWidth-margin, height-itemHeight-margin, 0);

      add(width*.12-itemWidth/2, margin, 8);
      add(width*.88-itemWidth/2, margin, 8);
      add(width*.12-itemWidth/2, height-itemHeight-margin, 8);
      add(width*.88-itemWidth/2, height-itemHeight-margin, 8);

      const anchors = [
        ...$$(".media-frame", section).slice(0, 3),
        ...$$(".map-frame, .map-toolbar, .primary-button, .pill-button", section).slice(0, 4)
      ];

      anchors.forEach((element, index) => {
        const rect = relativeRect(element.getBoundingClientRect(), layerRect);
        const gap = 12;
        add(rect.left-itemWidth-gap, rect.top-itemHeight*.15, 14+index);
        add(rect.right+gap, rect.top-itemHeight*.15, 14+index);
        add(rect.left, rect.top-itemHeight-gap, 18+index);
        add(rect.right-itemWidth, rect.bottom+gap, 18+index);
      });

      return result;
    }

    function positionLayer(layer) {
      const section = layer.parentElement;
      if (!section || !layer.clientWidth || !layer.clientHeight) return;

      const layerRect = layer.getBoundingClientRect();
      const width = layer.clientWidth;
      const height = layer.clientHeight;
      const protectedRects = collectProtectedRects(section, layerRect, 20);
      const placed = [];

      const active = $$(".corner-sketch.editorial-active.is-ready", layer)
        .filter(item => getComputedStyle(item).display !== "none");

      active.forEach((item, index) => {
        const isFocus = item.classList.contains("hero-moon-trail");
        const fitSteps = isFocus ? [1, .92, .84] : [1, .9, .8, .7, .62];
        let selected = null;

        for (const fitScale of fitSteps) {
          const geometry = transformedGeometry(item, fitScale);
          const margin = 14;

          if (
            geometry.visualWidth > width-margin*2 ||
            geometry.visualHeight > height-margin*2
          ) continue;

          const candidates = anchorCandidates(
            section,
            layerRect,
            width,
            height,
            geometry.visualWidth,
            geometry.visualHeight,
            margin
          );

          let bestScore = Infinity;
          let best = null;

          candidates.forEach(candidate => {
            const left = Math.max(
              margin,
              Math.min(width-geometry.visualWidth-margin, candidate.left)
            );
            const top = Math.max(
              margin,
              Math.min(height-geometry.visualHeight-margin, candidate.top)
            );
            const rect = {
              left,
              top,
              right:left+geometry.visualWidth,
              bottom:top+geometry.visualHeight
            };

            if (protectedRects.some(zone => overlaps(rect, zone))) return;
            if (placed.some(zone => overlaps(rect, zone, 28))) return;

            const centerX = left + geometry.visualWidth/2;
            const centerY = top + geometry.visualHeight/2;
            const central =
              centerX > width*.23 && centerX < width*.77 &&
              centerY > height*.18 && centerY < height*.82;

            const quadrant = `${centerX < width/2 ? "L" : "R"}${centerY < height/2 ? "T" : "B"}`;
            const sameQuadrant = placed.filter(zone => {
              const x = (zone.left+zone.right)/2;
              const y = (zone.top+zone.bottom)/2;
              return `${x < width/2 ? "L" : "R"}${y < height/2 ? "T" : "B"}` === quadrant;
            }).length;

            const areaRatio =
              (geometry.visualWidth*geometry.visualHeight) / Math.max(1, width*height);

            const score =
              candidate.weight +
              (central ? 420 : 0) +
              sameQuadrant*260 +
              areaRatio*2600 +
              (1-fitScale)*520 +
              index*.01;

            if (score < bestScore) {
              bestScore = score;
              best = { rect, geometry };
            }
          });

          if (best) {
            selected = best;
            break;
          }
        }

        if (!selected) {
          item.classList.add("is-placement-hidden");
          return;
        }

        item.classList.remove("is-placement-hidden");
        const { rect, geometry } = selected;
        const cssLeft = rect.left + geometry.visualInsetX;
        const cssTop = rect.top + geometry.visualInsetY;

        item.style.setProperty("--doodle-scale", geometry.scale.toFixed(3));
        item.style.left = `${Math.round(cssLeft)}px`;
        item.style.top = `${Math.round(cssTop)}px`;
        item.style.right = "auto";
        item.style.bottom = "auto";
        item.dataset.whitespacePlaced = "true";
        placed.push(rect);
      });
    }

    let placementFrame = 0;
    let placementTimer = 0;

    function placeAll() {
      $$(".corner-sketch-layer").forEach(positionLayer);
    }

    function schedulePlacement() {
      cancelAnimationFrame(placementFrame);
      clearTimeout(placementTimer);
      placementFrame = requestAnimationFrame(() => {
        placementFrame = requestAnimationFrame(placeAll);
      });
      placementTimer = setTimeout(placeAll, 220);
    }

    refreshEditorialDoodles = applyPolicy;

    window.addEventListener("resize", schedulePlacement, { passive:true });
    document.addEventListener("travel-memory-style-change", applyPolicy);
    document.fonts?.ready?.then(schedulePlacement).catch(() => {});

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        applyPolicy();
        schedulePlacement();
      });
      $$(".hero, .section-shell, .closing, .journal-grid, .map-layout, .archive-grid")
        .forEach(element => resizeObserver.observe(element));
    }

    if ("MutationObserver" in window) {
      const mutationObserver = new MutationObserver(() => {
        applyPolicy();
        schedulePlacement();
      });
      ["#journalGrid", "#archiveGrid", "#routeTimeline"].forEach(selector => {
        const element = $(selector);
        if (element) mutationObserver.observe(element, { childList:true, subtree:true });
      });
    }

    applyPolicy();
    setTimeout(applyPolicy, 520);
    setTimeout(applyPolicy, 1250);
  }

  function init() {
    initLoader(); painting = createPainting($("#paintCanvas")); initPaintAtmosphere(); applyMemoryStyle(state.memoryStyle, { persist:false, rerender:false }); bindEvents(); initEditableText(); initCornerSketches(); applyI18n(); initMapWhenNeeded();
  }
  document.addEventListener("DOMContentLoaded", init);
})();

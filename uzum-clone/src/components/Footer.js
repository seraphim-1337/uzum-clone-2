import '../styles/footer.css';

export function renderFooter() {
  return `
    <footer class="footer footer-premium">
      <div class="wrap footer__main"><div class="footer__grid">
        <section class="footer__brand">
          <a class="footer__logo" href="#/" aria-label="Uzum Market">uzum <i>market</i></a>
          <p>Маркетплейс с миллионами товаров и быстрой доставкой по Узбекистану.</p>
          <div class="footer__social" aria-label="Мы в социальных сетях">
            <a class="footer__social-link" href="#/" aria-label="Telegram">✈</a><a class="footer__social-link" href="#/" aria-label="Instagram">◎</a><a class="footer__social-link" href="#/" aria-label="Facebook">f</a><a class="footer__social-link" href="#/" aria-label="YouTube">▶</a>
          </div>
        </section>
        <section class="footer__col"><h2 class="footer__col-title">Покупателям</h2><nav class="footer__links" aria-label="Покупателям"><a href="#/catalog">Каталог товаров</a><a href="#/">Как сделать заказ</a><a href="#/">Доставка и оплата</a><a href="#/">Возврат товаров</a></nav></section>
        <section class="footer__col"><h2 class="footer__col-title">Помощь</h2><nav class="footer__links" aria-label="Помощь"><a href="#/">Частые вопросы</a><a href="#/">Служба поддержки</a><a href="#/">Безопасность покупок</a><a href="#/">Условия использования</a></nav></section>
        <section class="footer__col"><h2 class="footer__col-title">Продавцам</h2><nav class="footer__links" aria-label="Продавцам"><a href="#/">Стать продавцом</a><a href="#/">Кабинет продавца</a><a href="#/">Реклама на Uzum</a><a href="#/">Партнёрская программа</a></nav></section>
        <section class="footer__apps-col"><h2 class="footer__col-title">Скачайте приложение</h2><div class="footer__apps"><a class="footer__app-btn" href="#/" aria-label="Скачать в App Store"><span class="footer__app-icon"></span><span class="footer__app-btn-text"><small>Загрузите в</small><strong>App Store</strong></span></a><a class="footer__app-btn" href="#/" aria-label="Скачать в Google Play"><span class="footer__app-icon">▶</span><span class="footer__app-btn-text"><small>Доступно в</small><strong>Google Play</strong></span></a></div></section>
      </div></div>
      <div class="footer__bottom"><div class="wrap footer__bottom-inner"><span class="footer__copyright">© 2026 Uzum Market. Все права защищены.</span><div class="footer__payments" aria-label="Способы оплаты"><span>UZCARD</span><span>HUMO</span><span>VISA</span></div><div class="footer__bottom-links"><a href="#/">Конфиденциальность</a><a href="#/">Публичная оферта</a></div></div></div>
    </footer>`;
}

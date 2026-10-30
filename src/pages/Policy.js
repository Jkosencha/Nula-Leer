import React from "react";
import { Link, useParams } from "react-router-dom";
import { SHIPPING_OPTIONS } from "./CartContext";
import { townLabel } from "../components/DeliveryPicker";
import { CONTACT, whatsappLink } from "../config";
import usePageTitle from "../usePageTitle";

// Update this whenever the wording below changes.
const LAST_UPDATED = "30 October 2026";

const REGION_LABELS = { Others: "Rest of Kenya" };

const Email = () => <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;
const WhatsApp = () => (
  <a href={whatsappLink("Hi Nula Leer, ")} target="_blank" rel="noreferrer">
    WhatsApp ({CONTACT.phoneDisplay})
  </a>
);

const ContactLine = () => (
  <p>
    Questions? Message us on <WhatsApp /> or email <Email />.
  </p>
);

// Policy pages. Nula Leer sells online only, so every return, exchange and
// complaint starts with a message on WhatsApp or by email.
const POLICIES = {
  delivery: {
    title: "Delivery",
    intro: "We sell online only and deliver across Kenya. The delivery fee depends on your area and is shown at checkout.",
    body: () => (
      <>
        <h2>Delivery fees</h2>
        <div className="fee-tables">
          {Object.entries(SHIPPING_OPTIONS).map(([region, towns]) => (
            <table key={region} className="fee-table">
              <caption>{REGION_LABELS[region] || region}</caption>
              <tbody>
                {Object.entries(towns).map(([town, fee]) => (
                  <tr key={town}>
                    <td>{townLabel(town)}</td>
                    <td>KSh {fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>

        <h2>When your order is sent</h2>
        <ul className="bullets">
          <li>Pieces that are ready are packed and sent within 1–2 working days of payment.</li>
          <li>
            Made-to-order pieces are sent once they're finished. The making time is shown on the
            product page, and we'll keep you updated.
          </li>
          <li>Orders placed on a weekend or public holiday are handled on the next working day.</li>
        </ul>

        <h2>How long delivery takes</h2>
        <ul className="bullets">
          <li><b>Nairobi:</b> usually 1–2 working days after we send it, by rider.</li>
          <li><b>Mombasa and the rest of Kenya:</b> usually 2–5 working days after we send it, by courier.</li>
        </ul>
        <p>
          We'll message you on the phone number you gave at checkout to confirm the delivery day.
          Times are estimates and can be affected by things outside our control, such as weather or
          courier delays.
        </p>

        <h2>Receiving your order</h2>
        <p>
          Please make sure someone can receive the order at the address you gave. If a delivery
          fails because no one was available or the address was wrong, we'll arrange a second
          attempt, and the extra delivery fee is paid by you.
        </p>
        <p>
          Please check your parcel when it arrives. If anything is damaged in transit, tell us
          within 48 hours (see <Link to="/policies/returns">Returns & exchanges</Link>).
        </p>

        <h2>Your area isn't listed?</h2>
        <p>Message us and we'll tell you whether we can deliver there and what it costs.</p>
        <ContactLine />
      </>
    ),
  },

  returns: {
    title: "Returns & exchanges",
    intro:
      "Every piece is cut and stitched by hand. If something isn't right, we'll make it right. Here's how returns, exchanges and refunds work.",
    body: () => (
      <>
        <h2>Changed your mind</h2>
        <p>
          You can return or exchange a ready-made piece within <b>7 days of delivery</b>, as long
          as it is:
        </p>
        <ul className="bullets">
          <li>unused, unmarked and in the same condition you received it;</li>
          <li>returned with its original packaging and anything that came with it.</li>
        </ul>
        <p>
          You pay the delivery cost of sending it back to us. For an exchange, we cover sending the
          new piece to you.
        </p>

        <h2>What can't be returned</h2>
        <ul className="bullets">
          <li>Custom or personalised pieces (for example with initials, or made to your own size or design).</li>
          <li>Made-to-order pieces, once we've started making them.</li>
          <li>Pieces that have been used, altered or damaged after delivery.</li>
        </ul>
        <p>These can still be repaired or replaced if they're faulty (see below).</p>

        <h2>Damaged in delivery</h2>
        <p>
          If your order arrives damaged or isn't what you ordered, message us within{" "}
          <b>48 hours of delivery</b> with your order number and photos of the piece and the
          packaging. We'll collect it at our cost and send a replacement, or give you a full
          refund if a replacement isn't possible.
        </p>

        <h2>Our craftsmanship guarantee</h2>
        <p>
          We stand behind how our pieces are made. If stitching comes undone or hardware breaks
          from normal use within <b>6 months of delivery</b>, we'll repair the piece free of
          charge, or replace it if it can't be repaired.
        </p>
        <p>
          The guarantee doesn't cover normal wear, scratches, fading, water or heat damage, or
          damage from accidents or misuse. Natural leather marks and colour differences between
          pieces are part of handmade leather, not faults.
        </p>

        <h2>Refunds</h2>
        <ul className="bullets">
          <li>
            We refund within <b>5 working days</b> of receiving and checking the returned piece.
          </li>
          <li>Refunds go back the way you paid: M-Pesa to your M-Pesa number, card to your card.</li>
          <li>
            The original delivery fee isn't refunded, unless the piece was faulty, damaged in
            delivery or not what you ordered.
          </li>
        </ul>

        <h2>Cancelling an order</h2>
        <ul className="bullets">
          <li>Ready-made pieces: cancel any time before we send the order, for a full refund.</li>
          <li>
            Made-to-order and custom pieces: cancel within 24 hours of ordering for a full refund.
            After that, work has started and the order can't be cancelled.
          </li>
        </ul>

        <h2>How to start a return</h2>
        <ol className="bullets">
          <li>Message us on <WhatsApp /> or email <Email /> with your order number.</li>
          <li>Tell us what you'd like (refund or exchange) and, for a problem, send photos.</li>
          <li>We'll reply with where to send the piece, and confirm once it arrives.</li>
        </ol>
        <p className="muted small">
          This policy doesn't affect your rights under Kenya's Consumer Protection Act, 2012.
        </p>
      </>
    ),
  },

  privacy: {
    title: "Privacy",
    intro: "How Nula Leer collects, uses and protects your personal information.",
    body: () => (
      <>
        <h2>Who we are</h2>
        <p>
          Nula Leer is an online leather goods shop based in Nairobi, Kenya. We are responsible for
          the personal information you share with us when you shop or get in touch.
        </p>

        <h2>What we collect</h2>
        <ul className="bullets">
          <li><b>When you order:</b> your name, phone number, email, delivery address, delivery notes and any gift note.</li>
          <li><b>When you pay:</b> your M-Pesa number and transaction reference, or a confirmation from the card payment provider. We never see or store your full card details.</li>
          <li><b>When you contact us:</b> what you send us by WhatsApp, email or phone.</li>
        </ul>

        <h2>How we use it</h2>
        <ul className="bullets">
          <li>To process, make, pack and deliver your order.</li>
          <li>To contact you about your order, delivery, returns or questions.</li>
          <li>To keep the business and tax records the law requires.</li>
          <li>
            To send news and offers, but only if you've agreed to it. You can stop these at any
            time.
          </li>
        </ul>

        <h2>Who we share it with</h2>
        <p>Only the people needed to complete your order:</p>
        <ul className="bullets">
          <li>riders and couriers who deliver your order (your name, phone and address);</li>
          <li>payment providers who process your payment.</li>
        </ul>
        <p>We never sell or rent your personal information.</p>

        <h2>On this website</h2>
        <p>
          Your cart and wishlist are saved in your own browser so they're still there when you
          come back. They stay on your device and you can clear them at any time. We don't use
          advertising or tracking cookies.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep order records for as long as Kenyan tax and accounting law requires. Messages and
          other information are deleted once they're no longer needed.
        </p>

        <h2>Your rights</h2>
        <p>Under Kenya's Data Protection Act, 2019 you can:</p>
        <ul className="bullets">
          <li>ask what personal information we hold about you;</li>
          <li>ask us to correct it, or to delete it where we don't need to keep it;</li>
          <li>object to us using it, including for marketing;</li>
          <li>withdraw your consent at any time.</li>
        </ul>
        <p>
          Contact us to do any of these. If you're unhappy with how we handle your information,
          you can also complain to the Office of the Data Protection Commissioner (ODPC).
        </p>
        <ContactLine />
      </>
    ),
  },

  terms: {
    title: "Terms",
    intro: "These terms apply when you buy from the Nula Leer website. By placing an order you agree to them.",
    body: () => (
      <>
        <h2>About us</h2>
        <p>
          Nula Leer is an online shop selling handmade leather goods, based in Nairobi, Kenya. We
          sell only through this website and our official WhatsApp and social media accounts.
        </p>

        <h2>Prices and payment</h2>
        <ul className="bullets">
          <li>Prices are in Kenyan shillings (KSh). The delivery fee is shown separately at checkout.</li>
          <li>We accept M-Pesa and debit or credit cards.</li>
          <li>Prices may change, but the price you pay is the one shown when you place your order.</li>
        </ul>

        <h2>Your order</h2>
        <ul className="bullets">
          <li>Your order is confirmed once we receive full payment, and we'll send you a confirmation.</li>
          <li>
            If a piece becomes unavailable or a price was shown wrongly, we'll contact you and
            offer an alternative or a full refund.
          </li>
          <li>We may refuse an order we suspect is fraudulent.</li>
        </ul>

        <h2>Handmade pieces</h2>
        <p>
          Every piece is cut and stitched by hand from natural leather. Grain, colour and small
          marks vary from piece to piece and may look slightly different from the photos and on
          different screens. This is part of handmade leather, not a fault.
        </p>

        <h2>Made-to-order and custom pieces</h2>
        <ul className="bullets">
          <li>Making times shown on the site are estimates; we'll tell you if anything changes.</li>
          <li>
            For custom work, we agree the design, price and timeline with you in writing (WhatsApp
            or email) before we start. We may ask for a deposit, which isn't refundable once work
            has begun.
          </li>
        </ul>

        <h2>Delivery, returns and privacy</h2>
        <p>
          See our <Link to="/policies/delivery">Delivery</Link>,{" "}
          <Link to="/policies/returns">Returns & exchanges</Link> and{" "}
          <Link to="/policies/privacy">Privacy</Link> pages, which form part of these terms.
        </p>

        <h2>Our designs and content</h2>
        <p>
          The Nula Leer name, designs, photos and text on this website belong to Nula Leer. Please
          don't copy or use them without our permission.
        </p>

        <h2>Our responsibility</h2>
        <p>
          If something goes wrong with an order, our responsibility is limited to repairing,
          replacing or refunding the piece concerned. Nothing in these terms limits your rights as
          a consumer under Kenyan law.
        </p>

        <h2>Changes and governing law</h2>
        <p>
          We may update these terms from time to time; the version on this page when you order is
          the one that applies. These terms are governed by the laws of Kenya.
        </p>
        <ContactLine />
      </>
    ),
  },
};

export const POLICY_LINKS = Object.entries(POLICIES).map(([slug, p]) => ({ slug, title: p.title }));

const Policy = () => {
  const { slug } = useParams();
  const policy = POLICIES[slug];
  usePageTitle(policy?.title);

  if (!policy) {
    return (
      <div className="wrap empty" style={{ padding: "120px 0" }}>
        <h1>Page not found</h1>
        <Link to="/" className="btn">Back home</Link>
      </div>
    );
  }

  const Body = policy.body;
  return (
    <div className="wrap policy">
      <nav className="policy-nav" aria-label="Policies">
        {POLICY_LINKS.map((p) => (
          <Link key={p.slug} to={`/policies/${p.slug}`} className={p.slug === slug ? "on" : ""}>
            {p.title}
          </Link>
        ))}
      </nav>
      <article className="policy-body">
        <h1>{policy.title}</h1>
        <p className="lead">{policy.intro}</p>
        <Body />
        <p className="muted small updated">Last updated: {LAST_UPDATED}</p>
      </article>
    </div>
  );
};

export default Policy;

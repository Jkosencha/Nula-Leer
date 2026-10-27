import React from "react";
import { Link, useParams } from "react-router-dom";
import { SHIPPING_OPTIONS } from "./CartContext";
import { townLabel } from "../components/DeliveryPicker";
import { CONTACT } from "../config";
import usePageTitle from "../usePageTitle";

const REGION_LABELS = { Others: "Rest of Kenya" };

const ContactLine = () => (
  <p>
    Questions? Email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call{" "}
    <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>.
  </p>
);

// Page content. Delivery fees come from the live price table.
const POLICIES = {
  delivery: {
    title: "Delivery",
    intro: "We deliver across Kenya. The fee depends on where you are and is shown at checkout.",
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
        <h2>Delivery times</h2>
        <p>
          Once your order is confirmed we'll contact you to agree a delivery day. Pieces that are
          made to order need extra time, shown on the product page.
        </p>
        <h2>Your area isn't listed?</h2>
        <p>Get in touch and we'll tell you whether we can deliver there and what it costs.</p>
        <ContactLine />
      </>
    ),
  },
  returns: {
    title: "Returns & exchanges",
    intro: "Every piece is made by hand, and we want you to be happy with it.",
    body: () => (
      <>
        <h2>Changed your mind</h2>
        <p>
          You can return or exchange an unused piece within 7 days of delivery, in its original
          condition. Contact us first so we can arrange it. Delivery costs for returns are paid by
          the customer.
        </p>
        <h2>Faulty or damaged pieces</h2>
        <p>
          If something arrives damaged or develops a fault from how it was made, tell us within 14
          days and we'll repair or replace it at no cost.
        </p>
        <h2>Custom and made-to-order pieces</h2>
        <p>
          Pieces made to your own request can't be returned unless they're faulty, because they're
          made specially for you.
        </p>
        <h2>Refunds</h2>
        <p>Approved refunds are paid back using the method you paid with.</p>
        <ContactLine />
      </>
    ),
  },
  privacy: {
    title: "Privacy",
    intro: "This explains what information we collect and how we use it.",
    body: () => (
      <>
        <h2>What we collect</h2>
        <p>
          When you order or contact us we collect your name, email, phone number, delivery address
          and anything you write in notes or messages, such as a gift note.
        </p>
        <h2>How we use it</h2>
        <p>
          Only to process and deliver your order, to contact you about it, and to answer your
          messages. We don't sell your information. Payment details are handled by our payment
          provider and are never stored by us.
        </p>
        <h2>On this website</h2>
        <p>
          Your cart and wishlist are saved in your own browser so they're still there when you come
          back. You can clear them at any time.
        </p>
        <h2>Your rights</h2>
        <p>
          Under Kenya's Data Protection Act, 2019 you can ask to see, correct or delete the
          information we hold about you. Contact us and we'll take care of it.
        </p>
        <ContactLine />
      </>
    ),
  },
  terms: {
    title: "Terms",
    intro: "The basics of buying from Nula Leer.",
    body: () => (
      <>
        <h2>Orders and prices</h2>
        <p>
          Prices are in Kenyan shillings. Your order is confirmed once payment is received. If a
          piece becomes unavailable after you order, we'll contact you and offer a refund or an
          alternative.
        </p>
        <h2>Handmade pieces</h2>
        <p>
          Every piece is cut and stitched by hand from natural leather, so colour, grain and small
          marks vary from piece to piece and from the photos. That is part of its character, not a
          fault.
        </p>
        <h2>Delivery and returns</h2>
        <p>
          See our <Link to="/policies/delivery">delivery</Link> and{" "}
          <Link to="/policies/returns">returns</Link> pages.
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
      </article>
    </div>
  );
};

export default Policy;

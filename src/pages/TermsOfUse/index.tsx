import { BaseLayout } from "src/layouts/BaseLayout";
import "./styles.scss";

const TermsOfUse = () => {
  const handleClick = (dataTarget: string) => {
    scrollBy({
      top: document.querySelector(dataTarget)?.getBoundingClientRect().top - 16,
      behavior: "smooth",
    });
  };

  return (
    <BaseLayout>
      <div className="terms-of-use">
        <div className="terms-of-use-content">
          <div className="terms-of-use-content-top">
            <div className="terms-of-use-content-top-header">
              <h1 className="terms-of-use-content-top-header-title">Terms of Use</h1>
              <h3 className="terms-of-use-content-top-header-subtitle">Last Revised:</h3>
            </div>

            <div>
              <p className="terms-of-use-content-top-text">
                The website located at https://wormholescan.io/ is published, owned, and operated by
                Labs Group, LLC, its affiliates and related entities (“Labs Group” “ Company,” “we,”
                “us,” and “our”).
              </p>
              <p className="terms-of-use-content-top-text">
                These Terms of Use (the “Terms”) govern the user’s (“User” “you ” “your”) access to
                and use of the website whether accessed via computer, mobile device or otherwise
                (individually and collectively, the “Website,”) as well as any products and services
                provided by Labs Group LLC. (the “ Labs Group Service”) (the Website, together with
                the Labs Group Service, collectively referred to as the “Service”).
              </p>
            </div>

            <div className="terms-of-use-content-top-list">
              <h3 className="terms-of-use-content-top-list-title">Table of contents:</h3>

              <ul>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#acceptance-of-agreement")}>
                    Acceptance of Agreement
                  </p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#amendments")}>Amendments</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#definitions-and-other")}>
                    Definitions and interpretation
                  </p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#the-service")}>The service</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#privacy")}>Privacy</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#communication-with-users")}>
                    Communication with users
                  </p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#third-party-links")}>Third-party links</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#intellectual-property")}>Intellectual property</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#indemnification")}>Indemnification</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#assumptions-of-risk")}>Assumptions of risk</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#limitation-of-liability")}>
                    Limitation of liability and warranty disclaimer
                  </p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#term-and-termination")}>Term and termination</p>
                </li>
                <li className="terms-of-use-content-top-list-item">
                  <p onClick={() => handleClick("#general-terms")}>General terms</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="terms-of-use-content-bottom">
            <h2 className="terms-of-use-content-bottom-title" id="acceptance-of-agreement">
              1. ACCEPTANCE OF AGREEMENT
            </h2>
            <p className="terms-of-use-content-bottom-text">
              THESE TERMS OF SERVICE SET FORTH THE LEGALLY BINDING TERMS AND CONDITIONS THAT GOVERN
              YOUR USE OF THE SERVICE, AND ALL RELATED TOOLS, MOBILE APPLICATIONS, WEB APPLICATIONS,
              DECENTRALIZED APPLICATIONS, SMART CONTRACTS, AND APPLICATION PROGRAMMING INTERFACES
              (“APIS”) LOCATED AT ANY OF THE COMPANY’ WEBSITES, INCLUDING WITHOUT LIMITATION,
              SUCCESSOR WEBSITE(S) OR APPLICATION(S) THERETO (COLLECTIVELY, THE “PLATFORM”).
            </p>
            <p className="terms-of-use-content-bottom-text">
              THESE TERMS SET OUT YOUR RIGHTS AND RESPONSIBILITIES WHEN YOU USE THE PLATFORM FOR ANY
              PURPOSE, INCLUDING BUT NOT LIMITED TO VIEWING HISTORICAL DATA, TRANSACTION
              INFORMATION, STATISTICS, AND INFORMATION ON OTHER ACTIVITIES TAKING PLACE ON THE
              WORMHOLE. BY USING THE SERVICE OR ACCESSING THE PLATFORM IN ANY MANNER, YOU ACCEPT AND
              AGREE TO BE BOUND AND ABIDE BY THESE TERMS AND ALL OF THE TERMS INCORPORATED HEREIN BY
              REFERENCE. BY AGREEING TO THESE TERMS, YOU HEREBY CERTIFY THAT YOU ARE AT LEAST 18
              YEARS OF AGE. IF YOU DO NOT AGREE TO THESE TERMS OF USE, YOU MAY NOT ACCESS OR USE THE
              SITE OR THE PLATFORM.
            </p>
            <p className="terms-of-use-content-bottom-text">
              <strong>
                PLEASE BE AWARE THAT THESE TERMS OF SERVICE REQUIRE THE USE OF ARBITRATION (SECTION
                13.4)
              </strong>{" "}
              ON AN INDIVIDUAL BASIS TO RESOLVE DISPUTES, RATHER THAN JURY TRIALS OR CLASS ACTIONS,
              AND ALSO LIMIT THE REMEDIES AVAILABLE TO YOU IN THE EVENT OF A DISPUTE.
            </p>
            <p className="terms-of-use-content-bottom-text">
              By accessing, browsing, submitting information to and/or using the Website, you accept
              and agree to be bound and abide by these Terms and our Privacy Policy, incorporated
              herein by reference, and to comply with all applicable laws including, without
              limitation, all federal, state and local tax and tariff laws, regulations, and/or
              directives. Accordingly, under Article 6 of the General Data Protection Regulation, or
              “GDPR,” users in the European Union acknowledge and consent to our processing of
              personal data as necessary for the performance of these Terms, any applicable
              agreements, and use of the Website. If you do not agree to the Terms, please do not
              use the Website. The Terms of Service are referred to herein as the “Agreement .”
            </p>
            <h2 className="terms-of-use-content-bottom-title" id="amendments">
              2. AMENDMENTS
            </h2>
            <p className="terms-of-use-content-bottom-text">
              Company reserves the right to amend this Agreement, xLabs’ Privacy Policy described in
              Section below, at any time with reasonable notice, as determined by Company in its
              sole discretion. Company will post notice of any amendment on the Service. You should
              check this Agreement, and xLabs’ Privacy Policy regularly for updates. By continuing
              to use the Platform or Service after such notice is provided, you accept and agree to
              such amendments. If you do not agree to any amendment to any of these agreements, you
              must stop using the Platform and Service. If you have any questions about the terms
              and conditions in this Agreement, or xLabs’ Privacy Policy , please contact us at{" "}
              <a href="mailto:legal@xlabs.xyz">legal@xlabs.xyz.</a>
            </p>
            <h2 className="terms-of-use-content-bottom-title" id="definitions-and-other">
              3. DEFINITIONS AND INTERPRETATION
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">3.1.</span>
                <strong>Defined Terms.</strong> Unless the context requires otherwise, capitalized
                terms in this Agreement shall have the following meanings:
              </p>
              <ul>
                <li className="terms-of-use-content-bottom-text">
                  “Affiliate” means, with respect to a party, any person, firm, corporation,
                  partnership (including, without limitation, general partnerships, limited
                  partnerships, and limited liability partnerships), limited liability company, or
                  other entity that now or in the future, directly controls, is controlled with or
                  by or is under common control with such party.
                </li>
                <li className="terms-of-use-content-bottom-text">
                  “Wormholescan” means xLabs’ Wormholescan Explorer, which provides historical data,
                  statistics and information on other activities taking place on the Wormhole.
                </li>
                <li className="terms-of-use-content-bottom-text">
                  “Applicable Law” means the laws of the Republic of Panama, as the same may be
                  amended and in effect from time to time during the Term.
                </li>
                <li className="terms-of-use-content-bottom-text">
                  ”Business Day” means a day other than a Saturday, Sunday, or other day on which
                  commercial banks in the Republic of Panama are authorized or required to close.
                </li>
                <li className="terms-of-use-content-bottom-text">
                  “Wormhole” means a generic message passing protocol that enables communication
                  between blockchains, otherwise colloquially known as a blockchain bridge and other
                  associated services.
                </li>
              </ul>
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">3.2.</span>
                <strong>Interpretation.</strong> References to Sections and Appendices are to be
                construed as references to the Sections of, and Appendices to, this Agreement,
                unless otherwise indicated. The singular includes the plural, and the plural
                includes the singular. All references to hereof, herein, hereunder and other similar
                compounds of the word here shall mean and refer to this Agreement as a whole rather
                than any particular part of the same. The terms include and including are not
                limiting. Unless designated as Business Days, all references to days shall mean
                calendar days. The use of the word “including” in this Agreement to refer to
                specific examples will be construed to mean “including, without limitation” or
                “including but not limited to” and will not be construed to mean that the examples
                given are an exclusive list of the topics covered. The headings, captions, headers,
                footers and version numbers contained in this Agreement are intended for convenience
                or reference and shall not affect the meaning or interpretation of this Agreement.
              </p>
            </div>
            <h2 className="terms-of-use-content-bottom-title" id="the-service">
              4. THE SERVICE
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.1.</span>
                <strong>Purpose of the Website.</strong> The Website is provided for the purpose of
                providing Users with historical data, transaction information, statistics, and
                information on other activities taking place on the Wormhole. The Service, and the
                Platform are for educational purposes only and are not meant to provide any
                financial advice or indicate any trading opportunity. Any reliance you place on such
                information is strictly at your own risk. The Company disclaims all liability and
                responsibility arising from any reliance placed on such content by you or any other
                visitor to our Website, or by anyone who may be informed of any of its contents. Any
                information you provide or that is collected by the Company through the Website
                shall be handled in accordance with the Company’s Privacy Policy.
              </p>
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.2.</span>
                <strong>Use of the Website.</strong> The Company grants you a non-exclusive license
                to access and use the Platform including the Website and the data, material,
                content, or information herein (collectively, the “Content”) solely for your
                personal use. Your right to access and use the Website shall be limited to the
                purposes described in these Terms unless you are otherwise expressly authorized by
                the Company to use the Website for your own commercial purposes. You agree to use
                the Website only for lawful purposes, comply with all rules governing any
                transactions on and through the Website and comply with applicable laws.
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.2.1.</span>
                  Additional Considerations
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">4.2.1.1.</span>
                    <em>Transactions Are Recorded on the Public Blockchains.</em> Transactions that
                    take place on the Platform are managed and confirmed via public blockchains
                    supported by Wormhole. The User understands that its public address on the
                    relevant blockchain will be made publicly visible whenever it engages in a
                    transaction connecting supported blockchains. We neither own nor control any of
                    the supported blockchains or any other blockchain network. We will not be liable
                    for the acts or omissions of any such third parties, nor will we be liable for
                    any damage that a User may suffer as a result of its transactions or any other
                    interaction with any such third parties.
                  </p>

                  <p className="terms-of-use-content-bottom-text">
                    <span className="terms-of-use-content-bottom-text-number">4.2.1.2.</span>
                    <em>Transaction Fees.</em> All transactions on the Platform are facilitated by
                    smart contracts existing on a blockchain network. Blockchain networks generally
                    require the payment of a transaction fee for every cross-blockchain transaction.
                    The value of the Fee may vary depending on multiple factors and is entirely
                    outside of the control of the Company or the Platform. User acknowledges that
                    under no circumstances will a transaction on the Platform be invalidated,
                    revocable, retractable, or otherwise unenforceable on the basis that the Fee for
                    the given transaction was unknown, too high, or otherwise unacceptable to User.
                  </p>
                </div>
              </div>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.3.</span>
                <strong>License.</strong> Subject to this Agreement, the Company grants you a
                non-transferable, non-exclusive, revocable, limited license to use and access the
                Service solely for your own use, and solely as permitted by and in compliance with
                the Terms and Applicable Law. Such limited license may be revoked at any time in the
                Company’s sole discretion.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.4.</span>
                <strong>Prohibitions and Restrictions</strong>
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">4.4.1.</span>
                  Prohibited Uses. You agree that you will not:
                </p>

                <ul>
                  <li className="terms-of-use-content-bottom-text">
                    Use the Website in any manner that could damage, disable, overburden, or impair
                    the Website or interfere with any other party’s use and enjoyment of it;
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Attempt to gain unauthorized access to any Website account, computer systems or
                    networks associated with the Company or the Website;
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Obtain or attempt to obtain any materials or information through the Website by
                    any means not intentionally made available or provided by the Company;
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Use any robot, spider, or other automatic device, process or means to access the
                    Website for any purpose, including monitoring or copying any of the material on
                    the Website;
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Introduce any viruses, Trojan horses, worms, logic bombs, or other material
                    which is malicious or technologically harmful;
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Attack the Website via a denial-of-service attack or a distributed
                    denial-of-service attack; or
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Impersonate or attempt to impersonate the Company, a Company employee, another
                    user or any other person or entity (including, without limitation, by using
                    email addresses associated with any of the foregoing);
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    License, sell, rent, lease, transfer, assign, distribute, host, or otherwise
                    commercially exploit the Service, whether in whole or in part, or any content
                    displayed on the Service;
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Modify, make derivative works of, disassemble, reverse compile or reverse
                    engineer any part of the Service; or
                  </li>
                  <li className="terms-of-use-content-bottom-text">
                    Access the Service in order to build a similar or competitive website, product,
                    or service.
                  </li>
                </ul>
              </div>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.5.</span>
                <strong>Modification</strong>. Company reserves the right, at any time, to modify,
                suspend, or discontinue the Website (in whole or in part) with or without notice to
                you. You agree that the Company will not be liable to you or to any third party for
                any modification, suspension, or discontinuation of the Website or any part thereof.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.6.</span>
                <strong>No Support or Maintenance</strong>. You acknowledge and agree that Company
                will have no obligation to provide you with any support or maintenance in connection
                with the Website or Service.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.7.</span>
                <strong>Account Suspension</strong>. User agrees that Company has the right to
                immediately pause or cancel User’s access to the Service, Website, and the Platform
                if Company suspects, in its sole discretion, that; (i) User has engaged in
                fraudulent activity; or (ii) User has engaged in transactions in violation of these
                Terms of Use.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">4.8.</span>
                <strong>Affiliates</strong>. The rights, duties and/or obligations of Company under
                this Agreement may be exercised and/or performed by Company and/or any of Company’s
                Affiliates, or any of their subcontractors and/or agents. Company acknowledges and
                agrees that it shall be solely responsible for the acts or omissions of Company’s
                Affiliates, and any subcontractor or agent of Company or any of Company’s
                Affiliates, related to the subject matter hereof. You agree that any claim or action
                arising out of or related to any act or omission of any of Company or Company’s
                Affiliates, or any of their respective subcontractors or agents, related to the
                subject matter hereof, shall only be brought against Company, and not against any of
                Company’s Affiliates, or any subcontractor or agent of Company or any of Company’s
                Affiliates.
              </p>
            </div>

            <h2 className="terms-of-use-content-bottom-title" id="privacy">
              5. PRIVACY
            </h2>
            <p className="terms-of-use-content-bottom-text">
              You agree to Company’s Privacy Policy (available at https://xlabs.xyz/privacy-policy),
              which is incorporated by reference into this Agreement as if it were set forth herein
              in its entirety. The Privacy Policy describes how we collect, use, and disclose
              information provided by you. By using the Website or Service, you agree to, and are
              bound by, the terms of the Privacy Policy.
            </p>
            <h2 className="terms-of-use-content-bottom-title" id="communication-with-users">
              6. COMMUNICATION WITH USERS
            </h2>
            <p className="terms-of-use-content-bottom-text">
              You affirm that you are aware and acknowledge that Company is a non-custodial service
              provider and has designed this Platform to be directly accessible by the Users without
              any involvement or actions taken by Company or any third-party. The Company does not
              have a way to communicate directly with Users.
            </p>
            <h2 className="terms-of-use-content-bottom-title" id="third-party-links">
              7. THIRD-PARTY LINKS, PRODUCTS AND APPLICATIONS
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">7.1.</span>
                <strong>Third-party Sites</strong>. The Website may contain links to websites
                controlled or operated by persons and companies other than the Company (“Linked
                Sites”), including but not limited to any sites related to Web3 projects
                (occasionally hyperlinked as “Official”), Twitter, Instagram, TikTok, Discord,
                Reddit, Telegram, and Medium. Linked Sites are not under the control of the Company,
                and the Company is not responsible for the contents of any Linked Site, including
                without limitation any link contained on a Linked Site, or any changes or updates to
                a Linked Site. The Company is not responsible if the Linked Site is not working
                correctly or for any viruses, malware, or other harms resulting from your use of a
                Linked Site. The Company is providing these links to you only as a convenience, and
                the inclusion of any link does not imply endorsement by the Company of the site or
                any association with its operators. You are responsible for viewing and abiding by
                the privacy policies and terms of use posted on the Linked Sites. You are solely
                responsible for any dealings with third parties who support the Company or are
                identified on the Website, including any delivery of and payment for goods and
                services. The Company does not store any information shared with a Linked Site and
                is not responsible for any personally identifiable information shared with any
                Linked Site.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">7.2.</span>
                <strong>Third-party Applications</strong>. x
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">7.3.</span>
                <strong>Release</strong>. You hereby release and forever discharge the Company (and
                our officers, employees, agents, successors, and assigns) from, and hereby waive and
                relinquish, each and every past, present and future dispute, claim, controversy,
                demand, right, obligation, liability, action and cause of action of every kind and
                nature (including personal injuries, death, and property damage), that has arisen or
                arises directly or indirectly out of, or that relates directly or indirectly to, the
                Service (including any interactions with, or act or omission of, our partners or any
                other third party or any Third-party Links and Applications). IF YOU ARE A
                CALIFORNIA RESIDENT, YOU HEREBY WAIVE CALIFORNIA CIVIL CODE SECTION 1542 IN
                CONNECTION WITH THE FOREGOING, WHICH STATES: “A GENERAL RELEASE DOES NOT EXTEND TO
                CLAIMS WHICH THE CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT
                THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY
                AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR.”
              </p>
            </div>

            <h2 className="terms-of-use-content-bottom-title" id="intellectual-property">
              8. INTELLECTUAL PROPERTY
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">8.1.</span>
                <strong>Company Intellectual Property</strong>. User acknowledges and agrees that
                Company (or, as applicable, our licensors) own all legal right, title, and interest
                in and to all elements of the Platform. The Company logo, graphics, design, systems,
                methods, information, computer code, software, services, “look and feel”,
                organization, compilation of the content, code, data, and all other elements of the
                Platform (collectively, the “Company Materials”) are owned by the Company. The
                Website, Platform, Company Materials, and Content are protected by copyrights,
                trademarks, or are subject to other proprietary rights. Accordingly, you are not
                permitted to use the Website or Content in any manner, except as expressly permitted
                by the Company in these Terms. The Website or Content may not be copied, reproduced,
                modified, published, uploaded, posted, transmitted, performed, or distributed in any
                way, and you agree not to modify, rent, lease, loan, sell, distribute, transmit,
                broadcast, or create derivatives without the express written consent of the Company
                or the applicable owner. Except as expressly set forth herein, User’s use of the
                Platform does not grant User ownership of or any other rights with respect to any
                content, code, data, or other materials that User may access on or through the
                Platform. Company reserves all rights in and to the Company Materials not expressly
                granted to Users in the Terms.
              </p>

              <p className="terms-of-use-content-bottom-text">
                You may not use any Company Content to link to the Website or Content without our
                express written permission. You may not use framing techniques to enclose any
                Company Content without our express written consent. In addition, the look and feel
                of the Site and Content, including without limitation, all page headers, custom
                graphics, button icons, and scripts constitute the service mark, trademark, or trade
                dress of the Company and may not be copied, imitated, or used, in whole or in part,
                without our prior written permission.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <strong>Non-Company Intellectual Property</strong>. Outside the Company Materials,
                all other trademarks, product names, logos, and similar intellectual property on the
                Platform are the property of their respective owners and may not be copied,
                imitated, or used, in whole or in part, without the permission of the applicable
                trademark holder.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">8.2.</span>
                <strong>User-Generated Content</strong>.
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.2.1</span>
                  <strong>Responsibility for User-Generated Content</strong>. You are solely
                  responsible for the content of, and for any harm resulting from, any content that
                  you post, upload, link to or otherwise make available via the Service, regardless
                  of the form of that content (“User-Generated Content”). We are not responsible for
                  any public display or misuse of User-Generated Content. We have the right (though
                  not the obligation) to refuse or remove any User-Generated Content that, in our
                  sole discretion, violates any Company terms or policies.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.2.2</span>
                  <strong>Ownership of Content & Right to Post</strong>. If you are posting anything
                  you did not create yourself or do not own the rights to, you agree that you are
                  responsible for any content you post; that you will only submit content that you
                  have the right to post; and that you will fully comply with any third party
                  licenses relating to content you post.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.2.3</span>
                  <strong>License Grant to Use</strong>. We need the legal right to do things like
                  host User-Generated Content, publish it, and share it. You grant us and our legal
                  successors the right to store, parse, and display your content, and make
                  incidental copies as necessary to render the Website and provide the Service.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.2.4</span>
                  <strong>Moral Rights</strong>. You retain all moral rights to the content that you
                  upload, publish, or submit to any part of the Service, including the rights of
                  integrity and attribution.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">8.2.5</span>
                  <strong>Right to Use</strong>. To the extent this agreement is not enforceable by
                  applicable law, you grant Company the rights we need to use your content without
                  attribution and to make reasonable adaptations of User-Generated Content as
                  necessary to render the Website and provide the service.
                </p>
              </div>
            </div>

            <h2 className="terms-of-use-content-bottom-title" id="indemnification">
              9. INDEMNIFICATION
            </h2>
            <p className="terms-of-use-content-bottom-text">
              You agree to release, indemnify, and hold harmless the Company and its Affiliates, and
              their respective officers, directors, employees and agents, harmless from and against
              any claims, liabilities, damages, losses, and expenses, including, without limitation,
              reasonable legal and accounting fees, arising out of or in any way related to: (a)
              your access to, use of, or inability to use the Platform, the Website, or Service; (b)
              your breach of this Agreement; (c) your violation of any rights of a third party; (d)
              your violation of any Applicable Law; and (e) any and all financial losses you may
              suffer, or cause others to suffer, due to sending, receiving, and/or trading
              cryptocurrencies, or other digital assets whether or not such transactions were made
              due to information learned on the Platform or through the Service.
            </p>

            <h2 className="terms-of-use-content-bottom-title" id="assumptions-of-risk">
              10. ASSUMPTION OF RISK
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">10.1.</span>
                <strong>User Acknowledges the Risk of Cryptocurrency and Smart Contracts</strong>.
                YOU REPRESENT AND WARRANT THAT YOU UNDERSTAND AND ARE WILLING TO ACCEPT THE RISKS
                ASSOCIATED WITH CRYPTOGRAPHIC SYSTEMS SUCH AS SMART CONTRACTS, PUBLIC BLOCKCHAIN
                NETWORKS NON-FUNGIBLE TOKENS, AND THE INTERPLANETARY FILE SYSTEM.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">10.2.</span>
                <strong>Company is Not Responsible for Technical Errors on Any Blockchain</strong>.
                COMPANY IS NOT RESPONSIBLE FOR LOSSES DUE TO BLOCKCHAINS OR ANY OTHER FEATURES OF
                THE SUPPORTED NETWORKS OR ANY OTHER BLOCKCHAIN NETWORK COMPANY MAY INTERFACE WITH,
                OR THE METAMASK WALLET OR ANY SIMILAR BROWSER OR WALLET ON ANY BLOCKCHAIN NETWORK
                INCLUDING BUT NOT LIMITED TO LATE REPORT BY DEVELOPERS OR REPRESENTATIVES (OR NO
                REPORT AT ALL) OF ANY ISSUES WITH OTHER BLOCKCHAIN NETWORK COMPANIES MAY INTERFACE
                WITH, INCLUDING FORKS, TECHNICAL NODE ISSUES, OR ANY OTHER{" "}
                <strong>ISSUES HAVING FUND LOSSES</strong> AS A RESULT.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">10.3.</span>
                <strong>The User Acknowledges the Risks of the Platform</strong>. You acknowledge
                that the Platform is subject to flaws and acknowledge that you are solely
                responsible for evaluating any information provided by the Platform. This warning
                and others provided in this Agreement by Company in no way evidence or represent an
                ongoing duty to alert you to all of the potential risks of utilizing or accessing
                the Platform. The Platform may experience sophisticated cyber-attacks, unexpected
                surges in activity or other operational or technical difficulties that may cause
                interruptions to or delays on the Platform. You agree to accept the risk of the
                Platform failure resulting from unanticipated or heightened technical difficulties,
                including those resulting from sophisticated attacks, and you agree not to hold us
                accountable for any related losses. The Company will not bear any liability,
                whatsoever, for any damage or interruptions caused by any viruses that may affect
                your computer or other equipment, or any phishing, spoofing or other attack.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">10.4.</span>
                <strong>User Acknowledges Financial Risk of Digital Assets</strong>. The risk of
                loss in trading digital assets can be substantial. You should, therefore, carefully
                consider whether such creating, buying or selling digital assets is suitable for you
                in light of your circumstances and financial resources. By using the Platform, you
                represent that you have been, are and will be solely responsible for making your own
                independent appraisal. Under no circumstances shall the Company be liable in
                connection with your use of the Platform in connection with your performance of any
                digital asset transactions. Under no circumstances will the operation of all or any
                portion of the Platform be deemed to create a relationship that includes the
                provision or tendering of investment advice. User acknowledges and agrees that the
                Company is not a party to any agreement or transaction between one or more Users
                and/or third-parties involving the purchase, sale, charge, or transfer of
                cryptocurrency.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">10.5.</span>
                <strong>Violations by Other Users</strong>. User irrevocably releases, acquits, and
                forever discharges the Company and its subsidiaries, affiliates, officers, and
                successors for and against any and all past or future causes of action, suits, or
                controversies arising out of another user’s violation of these Terms.
              </p>
            </div>

            <h2 className="terms-of-use-content-bottom-title" id="limitation-of-liability">
              11. LIMITATION OF LIABILITY AND WARRANTY DISCLAIMER
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">11.1.</span>
                <strong>Limitation of Liability</strong>. TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN
                NO EVENT WILL THE COMPANY (OR OUR AFFILIATES) BE LIABLE TO YOU OR ANY THIRD PARTY
                FOR ANY FINANCIAL LOSS, LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT OF SUBSTITUTE
                PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE
                DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF, OR INABILITY TO USE,
                PLATFORM, THE WEBSITE OR THE SERVICE, CONTENT OR INFORMATION ACCESSED VIA THE
                WEBSITE, OR ANY DISRUPTION OR DELAY IN THE PERFORMANCE OF THE WEBSITE, OR THE
                SERVICE EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                ACCESS TO, AND USE OF, THE SITES OR SERVICE IS AT YOUR OWN DISCRETION AND RISK, AND
                YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, OR
                LOSS OF DATA RESULTING THEREFROM.
              </p>

              <p className="terms-of-use-content-bottom-text">
                SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR
                INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT
                APPLY TO YOU.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">11.2.</span>
                <strong>No Warranties</strong>. ALL INFORMATION OR SERVICE PROVIDED BY THE COMPANY
                TO YOU VIA THE WEBSITE, INCLUDING, WITHOUT LIMITATION, ALL CONTENT, ARE PROVIDED “AS
                IS” AND “WHERE IS” AND WITHOUT ANY WARRANTIES OF ANY KIND. THE COMPANY AND ANY
                THIRD-PARTY LICENSORS WITH CONTENT ON THE WEBSITE EXPRESSLY DISCLAIM ALL WARRANTIES,
                WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING, WITHOUT LIMITATION, THE WARRANTIES
                OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                NOTWITHSTANDING ANY PROVISION CONTAINED HEREIN TO THE CONTRARY, THE COMPANY AND ITS
                THIRD-PARTY LICENSORS MAKE NO REPRESENTATION, WARRANTY OR COVENANT CONCERNING THE
                ACCURACY, QUALITY, SUITABILITY, COMPLETENESS, SEQUENCE, TIMELINESS, SECURITY OR
                AVAILABILITY OF THE WEBSITE OR ANY CONTENT POSTED ON OR OTHERWISE ACCESSIBLE VIA THE
                PLATFORM. YOU SPECIFICALLY ACKNOWLEDGE THAT THE COMPANY AND ITS THIRD-PARTY
                LICENSORS ARE NOT LIABLE FOR THE DEFAMATORY, OBSCENE OR UNLAWFUL CONDUCT OF OTHER
                THIRD PARTIES OR USERS OF THE WEBSITE AND THAT THE RISK OF INJURY FROM THE FOREGOING
                RESTS ENTIRELY WITH YOU. NEITHER THE COMPANY NOR ANY OF ITS THIRD-PARTY LICENSORS
                REPRESENT, WARRANT OR COVENANT THAT THE WEBSITE WILL BE SECURE, UNINTERRUPTED OR
                ERROR-FREE. THE COMPANY FURTHER MAKES NO WARRANTY THAT THE WEBSITE WILL BE FREE OF
                VIRUSES, WORMS OR TROJAN HORSES OR THAT IT WILL FUNCTION OR OPERATE IN CONJUNCTION
                WITH ANY OTHER PRODUCT OR SOFTWARE. YOU EXPRESSLY AGREE THAT USE OF THE WEBSITE IS
                AT YOUR SOLE RISK AND THAT THE COMPANY, ITS AFFILIATES SHALL NOT BE RESPONSIBLE FOR
                ANY TERMINATION, INTERRUPTION OF SERVICE, DELAYS, ERRORS, FAILURES OF PERFORMANCE,
                DEFECTS, LINE FAILURES, OR OMISSIONS ASSOCIATED WITH THE WEBSITE OR YOUR USE
                THEREOF. YOUR SOLE REMEDY AGAINST THE COMPANY FOR DISSATISFACTION WITH THE WEBSITE
                OR THE CONTENT IS TO CEASE YOUR USE OF THE PLATFORM, WEBSITE AND/OR THE SERVICE.
                SOME JURISDICTIONS DO NOT PERMIT THE EXCLUSION OR LIMITATION OF IMPLIED WARRANTIES,
                SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. YOU MAY HAVE OTHER RIGHTS, WHICH VARY
                BY JURISDICTION. WHEN THE IMPLIED WARRANTIES ARE NOT ALLOWED TO BE EXCLUDED IN THEIR
                ENTIRETY, YOU AGREE THAT THEY WILL BE LIMITED TO THE GREATEST EXTENT AND SHORTEST
                DURATION PERMITTED BY LAW.
              </p>
            </div>

            <h2 className="terms-of-use-content-bottom-title" id="term-and-termination">
              12. TERM AND TERMINATION
            </h2>
            <p className="terms-of-use-content-bottom-text">
              Subject to this Section, this Agreement will remain in full force and effect while you
              use the Platform or use the Service (the “Term”). We may suspend or terminate your
              rights to use the Platform or use the Service at any time for any reason at our sole
              discretion, including for any use of the Platform or the Service in violation of this
              Agreement. All provisions of the Agreement which by their nature should survive, shall
              survive termination of Service, including without limitation, ownership provisions,
              warranty disclaimers, and limitation of liability.
            </p>

            <h2 className="terms-of-use-content-bottom-title" id="general-terms">
              13. GENERAL TERMS
            </h2>
            <div className="terms-of-use-content-bottom-list">
              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.1.</span>
                <strong>Changes to these Terms of Use</strong>. The Company may update or change
                these Terms from time to time in order to reflect changes in any offered services,
                changes in the law, or for other reasons as deemed necessary by the Company. The
                effective date of any Terms will be reflected in the “Last Revised” entry at the top
                of these Terms. Your continued use of the Website after any such change is
                communicated shall constitute your consent to such change(s).
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.2.</span>
                <strong>Waiver</strong>. The waiver by the Company of a breach of any provision
                contained herein shall be in writing and shall in no way be construed as a waiver of
                any subsequent breach of such provision or the waiver of the provision itself.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.3.</span>
                <strong>Governing Law & Jurisdiction</strong>. These Terms are governed by the laws
                of the Republic of Panama. You hereby irrevocably consent to the exclusive
                jurisdiction and venue of the courts in the Republic of Panama, in all disputes
                arising out of or relating to the use of the Website not subject to the Arbitration
                Agreement outlined in 13.4.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.4.</span>
                <strong>Dispute Resolution</strong>. Please read the following arbitration agreement
                in this Section (“Arbitration Agreement”) carefully. It requires you to arbitrate
                disputes with the Company and limits the manner in which you can seek relief from
                us. It is part of your contract with the Company and affects your rights. It
                contains procedures of MANDATORY BINDING ARBITRATION AND A CLASS ACTION WAIVER.
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.1.</span>
                  Applicability of Arbitration Agreement. All claims and disputes (excluding claims
                  for injunctive or other equitable relief as set forth below) in connection with
                  the Agreement or the use of any product or service provided by the Company that
                  cannot be resolved informally shall be resolved by binding arbitration on an
                  individual basis under the terms of this Arbitration Agreement. Unless otherwise
                  agreed to, all arbitration proceedings shall be held in English. This Arbitration
                  Agreement applies to you and the Company, and to any subsidiaries, Affiliates,
                  agents, employees, predecessors in interest, successors, and assigns, as well as
                  all authorized or unauthorized users or beneficiaries of services or goods
                  provided under the Agreement. This Arbitration Agreement shall apply, without
                  limitation, to all disputes or claims and requests for relief that arose or were
                  asserted before the effective date of this Agreement or any prior version of this
                  Agreement.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.2.</span>
                  Notice Requirement and Informal Dispute Resolution. Before either party may seek
                  arbitration, the party must first send to the other party a written Notice of
                  Dispute (“Notice”) describing the nature and basis of the claim or dispute, and
                  the requested relief. A Notice to the Company should be sent to:
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    xLabs, Inc. <br />
                    Attn: Legal Department <br />
                    Avenida Ricardo Arango y Calle No.61, <br />
                    P.O. Box 0816 01832 <br />
                    Obarrio Panamá, República de Panamá <br />
                    Email: legal@xlabs.xyz
                  </p>
                </div>

                <p className="terms-of-use-content-bottom-text">
                  After the Notice is received, you and the Company may attempt to resolve the claim
                  or dispute informally. If you and the Company do not resolve the claim or dispute
                  within thirty (30) days after the Notice is received, either party may begin an
                  arbitration proceeding. The amount of any settlement offer made by any party may
                  not be disclosed to the arbitrator until after the arbitrator has determined the
                  amount of the award, if any, to which either party is entitled.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.3.</span>
                  Arbitration Procedure. Any dispute, claim, interpretation, controversy, or issues
                  of public policy arising out of or relating to the xLabs Ecosystem, the Website,
                  these Terms, or the Services, including the determination of the scope or
                  applicability of this Section 13.4 will be determined exclusively by arbitration
                  held in the Republic of Panama, and shall be determined by arbitration
                  administered by the St. Vincent and the Grenadines Conciliation and Arbitration
                  Centre in accordance with its procedural rules. All rights and obligations
                  hereunder shall be governed by the Laws of the Republic of Panama, without regard
                  to the conflicts of law provisions of such jurisdiction. The Parties submit to the
                  non-exclusive jurisdiction of the courts of the Republic of Panama and any courts
                  competent to hear appeals from those courts. For purposes of this Section 13.4
                  “Proceeding” means any complaint, lawsuit, action, suit, claim (including a claim
                  of a violation of applicable law), or other proceeding at law or in equity, or
                  order or ruling, in each case by or before any governmental authority or arbitral
                  tribunal.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.4.</span>
                  The arbitrator may grant injunctive relief, including temporary, preliminary,
                  permanent, and mandatory injunctive relief, in order to protect the rights of each
                  party, but will not be limited to such relief. This provision for arbitration will
                  not preclude a Party from seeking temporary or preliminary injunctive relief (“
                  Provisional Relief”) in a court of Law while arbitration Proceedings are pending
                  in order to protect its rights pending a final determination by the arbitrator,
                  nor will the filing of such an action for Provisional Relief constitute waiver by
                  a Party of its right to seek arbitration. Any Provisional Relief granted by such
                  court will remain effective until otherwise modified by the arbitrator.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.5.</span>
                  Waiver of Jury Trial. THE PARTIES HEREBY WAIVE THEIR CONSTITUTIONAL AND STATUTORY
                  RIGHTS TO GO TO COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY, instead
                  electing that all claims and disputes shall be resolved by arbitration under this
                  Arbitration Agreement. Arbitration procedures are typically more limited, more
                  efficient and less costly than rules applicable in a court and are subject to very
                  limited review by a court. In the event any litigation should arise between you
                  and the Company in any court in a suit to vacate or enforce an arbitration award
                  or otherwise, YOU AND THE COMPANY WAIVE ALL RIGHTS TO A JURY TRIAL, instead
                  electing that the dispute be resolved by a judge.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.6.</span>
                  Waiver of Class or Consolidated Actions. ALL CLAIMS AND DISPUTES WITHIN THE SCOPE
                  OF THIS ARBITRATION AGREEMENT MUST BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL
                  BASIS AND NOT ON A CLASS BASIS, AND CLAIMS OF MORE THAN ONE CUSTOMER OR USER
                  CANNOT BE ARBITRATED OR LITIGATED JOINTLY OR CONSOLIDATED WITH THOSE OF ANY OTHER
                  CUSTOMER OR USER.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.7.</span>
                  30-Day Right to Opt Out. You have the right to opt out of the provisions of this
                  Arbitration Agreement by sending written notice of your decision to opt out within
                  thirty (30) days after first becoming subject to this Arbitration Agreement. Your
                  notice must include your name and address, your Wallet address, and an unequivocal
                  statement that you want to opt out of this Arbitration Agreement. If you opt out
                  of this Arbitration Agreement, all other parts of this Agreement will continue to
                  apply to you. Opting out of this Arbitration Agreement has no effect on any other
                  arbitration agreements that you may currently have, or may enter in the future,
                  with the Company. Mail your written notification by certified mail to:
                </p>

                <div className="terms-of-use-content-bottom-list">
                  <p className="terms-of-use-content-bottom-text">
                    xLabs, Inc. <br />
                    Attn: Legal Department <br />
                    Avenida Ricardo Arango y Calle No.61, <br />
                    P.O. Box 0816 01832 <br />
                    Obarrio Panamá, República de Panamá
                  </p>
                </div>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.8.</span>
                  Confidentiality. All aspects of the arbitration proceeding, including but not
                  limited to the award of the arbitrator and compliance therewith, shall be strictly
                  confidential. The parties agree to maintain confidentiality unless otherwise
                  required by law. This paragraph shall not prevent a party from submitting to a
                  court of law any information necessary to enforce this Agreement, to enforce an
                  arbitration award, or to seek injunctive or equitable relief.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.9.</span>
                  Severability. If any part or parts of this Arbitration Agreement are found under
                  the law to be invalid or unenforceable by a court of competent jurisdiction, then
                  such specific part or parts shall be of no force and effect and shall be severed
                  and the remainder of the Agreement shall continue in full force and effect.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.10.</span>
                  Right to Waive. Any or all of the rights and limitations set forth in this
                  Arbitration Agreement may be waived by the party against whom the claim is
                  asserted. Such waiver shall not waive or affect any other portion of this
                  Arbitration Agreement.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.11.</span>
                  Survival of Agreement. This Arbitration Agreement will survive the termination of
                  your relationship with the Company.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.12.</span>
                  Emergency Equitable Relief. Notwithstanding the foregoing, either party may seek
                  emergency equitable relief before a state or federal court in order to maintain
                  the status quo pending arbitration. A request for interim measures shall not be
                  deemed a waiver of any other rights or obligations under this Arbitration
                  Agreement.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.13.</span>
                  Claims Not Subject to Arbitration. Notwithstanding the foregoing, claims of
                  defamation, violation of the Computer Fraud and Abuse Act, and infringement or
                  misappropriation of the other party’s patent, copyright, trademark, or trade
                  secrets shall not be subject to this Arbitration Agreement.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.4.14.</span>
                  Courts. In any circumstances where the foregoing Arbitration Agreement permits the
                  parties to litigate in court, the parties hereby agree to submit to the personal
                  jurisdiction of the courts located in the Republic of Panama, for such purpose.
                </p>
              </div>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.5.</span>
                <strong>Attorneys’ Fees and Costs</strong>. In addition to any relief, order, or
                award that is entered by an arbiter, or court as the case may be, any Party found to
                be the substantially losing Party in any dispute shall be required to pay the
                reasonable attorneys’ fees and costs of any Party determined to be the substantially
                prevailing Party, and such losing Party, shall also reimburse or pay any of the
                arbitrator’s fees and expenses incurred by the prevailing Party in any arbitration.
                In the context of this Agreement, reasonable attorneys’ fees and costs shall include
                but not be limited to:
              </p>

              <div className="terms-of-use-content-bottom-list">
                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.5.1.</span>
                  legal fees and costs, the fees and costs of witnesses, accountants, experts, and
                  other professionals, and any other forum costs incurred during, or in preparation
                  for, a dispute;
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.5.2.</span>
                  all of the foregoing whether incurred before or after the initiation of a
                  Proceeding; and
                </p>

                <p className="terms-of-use-content-bottom-text">
                  <span className="terms-of-use-content-bottom-text-number">13.5.3.</span>
                  all such fees and costs incurred in obtaining Provisional Relief.
                </p>

                <p className="terms-of-use-content-bottom-text">
                  It is understood that certain time entries that may appear in the billing records
                  of such Party’s legal counsel may be redacted to protect attorney-client or
                  work-product privilege, and this will not prevent recovery for the associated
                  billings.
                </p>
              </div>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.6.</span>
                <strong>Third Party Beneficiaries</strong>. Except as limited by Section 13.7, this
                Agreement and the rights and obligations hereunder shall bind and inure to the
                benefit of the parties and their successors and permitted assigns. Nothing in this
                Agreement, expressed or implied, is intended to confer upon any person, other than
                the parties and their successors and permitted assigns, any of the rights hereunder.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.7.</span>
                <strong>Entire Agreement</strong>. This Agreement and each of its exhibits or
                appendices, constitute and contain the entire agreement between the parties with
                respect to the subject matter hereof and supersedes any prior or contemporaneous
                oral or written agreements. Each party acknowledges and agrees that the other has
                not made any representations, warranties or agreements of any kind, except as
                expressly set forth herein.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.8.</span>
                <strong>Severability</strong>. If any provision of this Agreement (or any portion
                thereof) is determined to be invalid or unenforceable, the remaining provisions of
                this Agreement shall not be affected thereby and shall be binding upon the parties
                and shall be enforceable, as though said invalid or unenforceable provision (or
                portion thereof) were not contained in this Agreement.
              </p>

              <p className="terms-of-use-content-bottom-text">
                <span className="terms-of-use-content-bottom-text-number">13.9.</span>
                <strong>Assignment</strong>. You may not assign or transfer any rights hereunder
                without the prior written consent of the Company. Except as provided in this
                section, any attempts you make to assign any of your rights or delegate any of your
                duties hereunder without the prior written consent of the Company shall be null and
                void. The Company may assign this Agreement or any rights hereunder without consent.
              </p>
            </div>

            <p className="terms-of-use-content-bottom-text">
              <strong>Company Contact Information</strong>. Questions can be directed to the Company
              at: <a href="mailto:legal@xlabs.xyz">legal@xlabs.xyz.</a>
            </p>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default TermsOfUse;

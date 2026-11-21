export type FreemarkerPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const freemarkerPreviewSnippets: FreemarkerPreviewSnippet[] = [
  {
    title: "Spring MVC page",
    description: "an .ftlh view with a layout macro, a loop, and defaults",
    code: `<#import "/layout.ftlh" as layout>
<#import "/spring.ftl" as spring>

<@layout.page title="Orders">
  <h1>Orders for \${customer.name!"unknown customer"}</h1>

  <#if orders?has_content>
    <table class="orders">
      <thead>
        <tr><th>#</th><th>Date</th><th>Status</th><th>Total</th></tr>
      </thead>
      <tbody>
        <#list orders as order>
          <tr class="\${order?item_parity}">
            <td><a href="<@spring.url '/orders/\${order.id}'/>">\${order.number}</a></td>
            <td>\${order.placedAt?date?string.medium}</td>
            <td>\${order.status?lower_case?cap_first}</td>
            <td>\${order.total?string.currency}</td>
          </tr>
        </#list>
      </tbody>
    </table>
  <#else>
    <p>No orders yet.</p>
  </#if>
</@layout.page>`,
  },
  {
    title: "Macro library",
    description: "macros with defaults, nested content, and a function",
    code: `<#-- Shared form helpers. Import with <#import "/lib/forms.ftlh" as f>. -->
<#macro field name label type="text" required=false>
  <div class="field<#if (errors[name]!)?has_content> has-error</#if>">
    <label for="\${name}">\${label}<#if required> *</#if></label>
    <input id="\${name}" name="\${name}" type="\${type}"
           value="\${(form[name])!}"<#if required> required</#if>>
    <#nested>
  </div>
</#macro>

<#function initials fullName>
  <#local parts = fullName?trim?split(" ")>
  <#return parts?map(p -> p?substring(0, 1))?join("")?upper_case>
</#function>

<#macro avatar user size=32>
  <span class="avatar" style="width: \${size}px">\${initials(user.name)}</span>
</#macro>`,
  },
  {
    title: "Email template",
    description: "switch, assign, ranges, and old-style number output",
    code: `<#ftl output_format="HTML" strip_whitespace=true>
<#assign greeting = (.now?string("H")?number < 12)?then("Good morning", "Hello")>
<p>\${greeting}, \${recipient.firstName}!</p>

<#switch shipment.state>
  <#case "SHIPPED">
    <p>Your parcel is on its way. Track it with code
      <strong>\${shipment.trackingCode}</strong>.</p>
    <#break>
  <#case "DELAYED">
    <p>Your parcel is late by #{shipment.delayDays} day(s).</p>
    <#break>
  <#default>
    <p>We are packing your order.</p>
</#switch>

<ul>
  <#list shipment.items[0..*3] as item>
    <li>\${item.qty} x \${item.name?html}</li>
  </#list>
</ul>
<#if (shipment.items?size > 3)>
  <p>...and \${shipment.items?size - 3} more.</p>
</#if>`,
  },
];

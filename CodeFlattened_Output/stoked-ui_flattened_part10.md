# Project Digest Continued: stoked-ui
Generated on: Mon Apr 14 2025 11:57:49 GMT-0500 (Central Daylight Time)


## docs/pages/blog/mui/2020-q3-update.md <a id="2020-q3-update_md"></a>

---
title: Q3 2020 Update
description: An update on our mission for Q3 2020.
date: 2020-10-14T00:00:00.000Z
authors: ['oliviertassinari']
tags: ['Company']
manualCard: true
---

This update covers our progress over the last three months, and what we aim to achieve in the coming months.

## Product

Here are the most significant improvements since June 2020. This was a dense quarter!

- 🚧 We have started the quarter with the first pre-release [v5.0.0-alpha.1](https://github.com/mui/material-ui/releases?after=v5.0.0-alpha.1) of the next major iteration of the library.
  There have been eleven more pre-releases since then. During the alpha development stage of version 5, we are focusing on making the planned breaking changes, as well as developing new features.
  On the breaking changes side, we have made almost half of the changes that we have planned.
- 🧪 We have promoted 7 components from the lab to the core: Alert, Autocomplete, Pagination, Rating, Skeleton, SpeedDial, and ToggleButton.
  Thank you for all your feedback on these components.
  While we still plan a couple of breaking changes on them, we are confident that they have reached the same level of quality as the other core components.
- 👮 We have introduced a new component in the lab, the [FocusTrap](https://mui.com/base-ui/react-focus-trap/). It manages focus for its descendants. This is useful when implementing overlays such as modal dialogs, which should not allow the focus to escape while open:

  <video style="max-height: 416px; margin-bottom: 24px;" autoplay muted loop playsinline>
    <source src="/static/blog/2020-q3-update/trap-focus.mp4" type="video/mp4" />
  </video>

- ⚛️ We have prepared the support for the upcoming release of [React v17](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html). Most of the work was about better handling events, and updating our test infrastructure to run the whole test suite with the _latest_ and _next_ version of React.<br />We have also improved `StrictMode` support. The last standing issues are being addressed with the work on the style engine. More on that later in the post.
- 💅 We have introduced a new dynamic variant API. This API allows developers to add new variants to Material UI components right from the theme, without having to wrap the components. For instance with the Button:

  ```tsx
  // Define the style that should be applied for specific props.
  const theme = createMuiTheme({
    components: {
      MuiButton: {
        variants: [
          {
            props: { variant: 'dashed', color: 'secondary' },
            styles: {
              border: `4px dashed ${red[500]}`,
            },
          },
        ],
      },
    },
  });

  // Optionally retain type safety:
  declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
      dashed: true;
    }
  }

  // Enjoy!
  <Button variant="dashed" color="secondary" />;
  ```

  This change is part of a direction to ease the implementation of custom design systems.
  Note that the API not only allows to match a single prop, but also a combination of props.
  This is especially interesting to resolve the conflict when different variants try to modify the same CSS property.

  Hopefully, in the future, we will be able to take advantage of the variant feature [coming in Figma](https://help.figma.com/hc/en-us/articles/360055471353-Prepare-for-Variants) with this API.

- ⚡️ We have released a first alpha version of the [data grid component](/x/react-data-grid/).<br />
  We announced our intent to build this component [a year ago](/blog/september-2019-update/#our-roadmap-intent-for-october). While we could have implemented a simple version and release it a month later, it wouldn't have set us in the right direction for the years to follow. We're aiming aim to deliver the best-in-class React data grid.
  This objective requires a twin licensing model. The component is available under an MIT license for the features that can be relatively easily implemented, and that can be sustained with an open-source model; as well as a paid commercial license for the more advanced features.
  <br />To ensure we could meet this objective, we spent time finding an expert in the field. This led us to open a new job position, and, a few months later, [Damien Tassone](/blog/spotlight-damien-tassone/) joined to lead the work on this component.

  <a href="/x/react-data-grid/"><img src="/static/blog/2020-q3-update/data-grid.png" alt="" style="width: 829px; margin-bottom: 8px;" /></a>

  <p class="blog-description">100,000 rows</p>

  After 6 months of development since the initial commit (March 15th, 2020), you can start using the component! (It targets v4.)

- ⚡️ The data grid effort has led to the introduction of a new repository: [_mui/mui-x_](https://github.com/mui/mui-x). This is the repository that will host all the future commercial components, all the components that we can't sustain with the open-source model. MUI X is our next iteration in scaling MUI, both as a company and as a comprehensive React library of components. While we have an existing sustainability model that can support, in long term, up to 10 people full-time, we are keen to push it by an order of magnitude.
- 🛠 We have migrated parts of the codebase to TypeScript.<br />
  We had to work on the code infrastructure of _mui/material-ui_ to prepare to host the date picker components that are written in TypeScript inside the lab (coming from _mui/material-ui-pickers_ that we will archive once we can).

  <img src="/static/blog/2020-q3-update/typescript-mui.png" alt="" style="width: 299px; margin-bottom: 8px;" />

  <p class="blog-description">MUI's repository</p>

  On the other hand, we started using TypeScript from day one for _mui/mui-x_.

  <img src="/static/blog/2020-q3-update/typescript-mui-x.png" alt="" style="width: 299px; margin-bottom: 8px;" />

  <p class="blog-description">MUI X's repository</p>

- 🐙 We have migrated large parts of the test suite to react-testing-library.<br>
  15 months ago, we introduced the very [first test](https://github.com/mui/material-ui/pull/15732) using the library (to replace enzyme). Last month, react-testing-library had [more downloads](https://npm-stat.com/charts.html?package=enzyme&package=%40testing-library%2Freact&from=2019-10-10&to=2020-10-10) than enzyme!

  <img src="/static/blog/2020-q3-update/react-testing-library.png" alt="" style="width: 640px; margin-bottom: 40px; margin-top: 24px;" />

- 💅 We have completed the first iteration of the unstyled components for v5.<br />You can find a [new version](/material-ui/react-slider/#unstyled) of the slider in the lab without any styles.
  The unstyled component weighs in at [5.2 kB gzipped](https://bundlephobia.com/package/@mui/lab@5.0.0-alpha.12), compared with 26 kB for the styled version (when used standalone). The component is best suited for use when you want to fully customize the look, without reimplementing the JavaScript and accessibility logic.<br />
  We're also pushing in this direction to address a concern we hear from large enterprises
  that want to be able to go one layer down in the abstraction, in order to gain more control.

  ```jsx
  import SliderUnstyled from '@mui/lab/SliderUnstyled';
  ```

  Note that we have experimented with headless components (hooks only) in the past. For instance, you can leverage the [useAutocomplete](/material-ui/react-autocomplete/#useautocomplete), and [usePagination](/material-ui/react-pagination/#usepagination) hooks. However, we are pushing with unstyled first as a required step for the next item: ⬇️.

- 👩‍🎨 We have completed the first iteration of the new styling solution of v5.<br />
  You can find a [new version](/material-ui/react-slider/) of the slider in the lab powered by [Emotion](https://emotion.sh/docs/introduction).<br />
  If you are already using styled-components in your application, you can swap Emotion for styled-components 💅. Check this [CodeSandbox](https://codesandbox.io/p/sandbox/sliderstyled-with-styled-components-forked-olc27?file=/package.json) or [CRA](https://github.com/mui/material-ui/tree/HEAD/examples/material-ui-cra-styled-components/) for a demo. It relies on aliases to prevent any bundle size overhead.<br />
  The new styling solution saves 2kB+ gzipped in the bundle compared to JSS, and about 14 kB gzipped if you were already using styled-components or Emotion.<br />
  Last but not least, this change allows us to take advantage of dynamic style props. We will use them for dynamic color props, variant props, and new style props available in the core components.

  <img src="/static/blog/2020-q3-update/emotion.png" alt="" style="width: 329px;" />

  <p class="blog-description">Slider powered by Emotion</p>

  <img src="/static/blog/2020-q3-update/styled-components.png" alt="" style="width: 323px;" />

  <p class="blog-description">Slider powered by styled-components</p>

- ♿︎ We have kept investing in accessibility, we have fixed [13 bugs](https://github.com/mui/material-ui/pulls?q=is%3Apr+label%3Aaccessibility+is%3Aclosed+sort%3Aupdated-desc).
- 🗓 We have introduced public quarterly roadmaps, both for each [MUI Core](https://github.com/mui/material-ui/projects?query=is%3Aopen) product and [MUI X](https://github.com/mui/mui-x/projects/1).

## Company

We are thrilled to welcome two new full-time developers to MUI:

- [Marija Najdova](https://github.com/mnajdova). Marija joins us from the Fluent-UI React team at Microsoft. She's allowing the community team to move faster. You can learn more about her in the [introduction blog post](/blog/marija-najdova-joining/).

  <img src="https://avatars.githubusercontent.com/u/4512430?s=320" alt="marija" style="max-width: 160px; margin: unset; margin-bottom: 24px; border-radius: 2px;" />

- [Danail Hadjiatanasov](https://github.com/DanailH). Danail comes to us from the Fintech industry. He's allowing the enterprise team to move faster, he's helping Damien push the data grid further.

  <img src="https://avatars.githubusercontent.com/u/5858539?s=320" alt="marija" style="max-width: 160px; margin: unset; margin-bottom: 24px; border-radius: 2px;" />

### Growth between Q2 2020 and Q3 2020

- 📦 From 5.1M to 6.0M downloads per month on npm.<br />
  While React is growing, we are also growing inside its ecosystem.

  <img src="/static/blog/2020-q3-update/react-share.png" alt="" style="width: 588px; margin-bottom: 16px;" />

  <p class="blog-description">% of download relative to react-dom</p>

- ⭐️ From 59.0k to 61.6k stars, leave us yours [🌟](https://github.com/mui/material-ui).
- 👨‍👩‍👧‍👦 From 1,825 to 1,934 contributors on GitHub. We add on average 1 new contributor every day.
- 🏢 We have welcomed two new full-time developers to MUI.

## Our roadmap intent for Q4 2020

We'll do our best, no guarantee!

### Community

- 🗓 Execute on all the items of the [public roadmap](https://github.com/orgs/mui/projects/23/views/12).
- 👩‍🎨 Simplify the migration experience from v4 to v5.
- ❓ Please upvote [GitHub issues](https://github.com/mui/material-ui/issues) if you want us to focus on a specific problem. The number of 👍 helps us to prioritize.

### Enterprise

- 👩‍🎨 Complete the collaboration we started with a design agency last quarter to update the branding of the company, redesign the homepage, and design the marketing pages for the enterprise package.
- 🗓 Execute on all the items in the [public roadmap](https://github.com/mui/mui-x/projects/1).
- ❓ Please upvote [GitHub issues](https://github.com/mui/mui-x/issues) if you want us to focus on a specific problem. The number of 👍 helps us to prioritize.

### Company

These are objectives, no guarantees:

- 🏢 We might hire a full-time designer that has coding skills. One of the objectives would be to solve [#22485](https://github.com/mui/material-ui/issues/22485).
- 🏝 We have put the company-wide team retreat on hold because of the continued risk presented by COVID-19.
  Hopefully, we will be able to hold it in Q2 2021.

## docs/pages/blog/mui/2020-q1-update.md <a id="2020-q1-update_md"></a>

---
title: Q1 2020 Update
description: An update on our mission for Q1 2020.
date: 2020-04-14T00:00:00.000Z
authors: ['oliviertassinari']
tags: ['Company']
manualCard: true
---

Welcome to the new format of our mission update. We are moving from monthly to quarterly updates.

## Product

Over the last 3 months, we have focused on making patch releases.
We have done eleven so far. We have optimized for stability.

Here are the most significant improvements since the beginning of the year:

- 🔍 We have polished the [Autocomplete](https://mui.com/material-ui/react-autocomplete/) component (Combo box). We have closed more than [270](https://github.com/mui/material-ui/labels/lab%3A%20Autocomplete) issues and pull requests so far. We will promote the component to the core in the next major (v5).

  ![autocomplete](/static/blog/2020-q1-update/autocomplete.gif)

  <p class="blog-description">useAutocomplete <a href="https://mui.com/material-ui/react-autocomplete/#useautocomplete">hook</a> example, 4.5 kB gzipped.</p>

  If you wish to make your first contribution to open source, the component has a couple of ["good first issues"](https://github.com/mui/material-ui/labels/lab%3A%20Autocomplete) that can be taken.
  If you have TypeScript expertise, the component could [benefit from it](https://github.com/mui/material-ui/issues?q=is%3Aopen+label%3A%22lab%3A+Autocomplete%22+label%3Atypescript).

- 📆 We have made a first [alpha release](https://github.com/mui/material-ui-pickers/releases/tag/v4.0.0-alpha.4) of the date range picker. It's not ready to be used in production but you can start playing. We might release some of the new features of the date picker under the upcoming Enterprise offering.

  ![date picker](/static/blog/2020-q1-update/date-picker.png)

- ⚠️ We have introduced a new [Alert](https://v4.mui.com/components/alert/) component in the lab. While this component isn't mentioned in the Material Design guidelines, it's a common and well-established pattern. For instance, it can be interested when [combined](https://v4.mui.com/components/snackbars/#notistack) with the Snackbar.

  <img src="/static/blog/2020-q1-update/alert.png" alt="alert" style="max-height: 369px; margin-bottom: 24px;" />

- ⏭ We have introduced a new [Pagination](https://v4.mui.com/components/pagination/) component.

  <img src="/static/blog/2020-q1-update/pagination.png" alt="pagination" style="max-height: 208px; margin-bottom: 8px;" />

- 🦴 We have added a new "wave" animation to the [Skeleton](https://v4.mui.com/components/skeleton/#animations) component.

  <video style="max-height: 95px; margin-bottom: 24px;" autoplay muted loop playsinline>
    <source src="/static/blog/2020-q1-update/skeleton.webm" type="video/webm" />
  </video>

- ⚛️ We have worked on improving developer experience inside text editors.

  - We have migrated prop descriptions from JSDoc to TypeScript for 60% of the components. Back-and-forths with the documentation API will be less frequent:

  ![props](/static/blog/2020-q1-update/props.png)

  - The color modules come with new previews:

  ![colors](/static/blog/2020-q1-update/colors.png)

  - We have collaborated with [Andy Edwards](https://github.com/jedwards1211) to provide [snippets](https://marketplace.visualstudio.com/items?itemName=vscodeshift.material-ui-snippets) with Visual Studio Code:

  ![snippets](/static/blog/2020-q1-update/snippets.gif)

- 💎 We have introduced [Sketch assets](/blog/2020-introducing-sketch/).

  <img src="/static/blog/2020-q1-update/sketch.png" alt="sketch" style="max-width: 160px;" />

But this summary is just scratching the surface. We have accepted 572 commits from 214 different contributors.

## Company

We are thrilled to welcome two new full-time developers on MUI:

- [Dmitriy Kovalenko](https://github.com/dmtrKovalenko), the author of @material-ui/pickers.
  <img src="https://avatars.githubusercontent.com/u/16926049" alt="dmitriy" style="max-width: 160px; margin: unset; margin-bottom: 24px; border-radius: 2px;" />

- [Damien Tassone](https://github.com/dtassone/), an experienced developer in the finance industry.
  <img src="https://avatars.githubusercontent.com/u/936978" alt="damien" style="max-width: 160px; margin: unset; margin-bottom: 24px; border-radius: 2px;" />

### Growth between Q4 2019 and Q1 2020

- 📦 From 3.2M to 4.8M downloads per month on npm.
- ⭐️ From 53.3k to 56.2k stars, leave us yours 🌟.
- 👨‍👩‍👧‍👦 From 1,581 to 1,720 contributors on GitHub.
- 💰 Grew monthly financial support by 47%.
- 🏢 From 3 to 5 full-time equivalent developers, spread among multiple financially supported core team members.

## Our roadmap intent for Q2 2020

We'll do our best, no guarantee!

- 📣 We will analyze and publish the results of the "Material UI Developer Survey 2020". If you haven't contributed to it yet, you can follow this link to [fill it in](https://forms.gle/TYWRdvgyZs4AhZNv8), thanks!
- 🎨 We will release Figma assets for MUI.

  <img src="/static/blog/2020-q1-update/figma.png" alt="figma" style="max-width: 160px; margin-bottom: 24px;" />

- 🇨🇳 We will translate 100% of the documentation to Chinese. We are collaborating with [Danica Shen](https://github.com/DDDDDanica), a native speaker, to complete the effort. So far, we have translated 73% of the documentation and peer-reviewed 39%. You can help us out on [Crowdin](https://crowdin.com/project/material-ui-docs).

  <img src="/static/blog/2020-q1-update/chinese.png" alt="chinese" style="max-width: 134px; margin-bottom: 24px;" />

- 🔥 We will start to work on the [next major: v5](https://github.com/mui/material-ui/issues/20012).
  You can expect the following:

  - A feature freeze on v4.
  - The introduction of deprecation messages in the next v4 minors. These messages will help developers upgrade to v5.
  - A progressive bug fixes freeze on v4, with the exception of security issues and important bugs.
  - At least 6 months of work on v5 to get to a stable release (probably more). You can follow our progress using our [milestone](https://github.com/mui/material-ui/milestone/35).

- 🧑‍💻 We will likely look to hire a new full-time member on the core team to help deliver v5 and new features faster.
- ⌗ We announced, back in [October 2019](/blog/september-2019-update/#our-roadmap-intent-for-october), our intention to work on an advanced data grid component. The task was bigger than anticipated, but we are making progress. It might take us 12 months to do it right. Damien is now leading and fully dedicated to this effort. You can follow our early-stage progress on [finui.io](https://finui.io/#/grid) and later, integration into the mono-repository on [#18872](https://github.com/mui/material-ui/pull/18872).

  ![data grid](/static/blog/2020-q1-update/data-grid.png)

  <p class="blog-description">For <a href="https://uxdesign.cc/design-better-data-tables-4ecc99d23356">illustration</a> purposes only.</p>

- 📆 We will polish the date picker. We will work on: providing a comprehensive set of features, to unify the experience with the core package, to improve the overall quality. The objective is to make these components stable in the next major (v5).
- ❓ Please upvote our [GitHub issues](https://github.com/mui/material-ui/issues) if you want something specific. The number of 👍 helps us to prioritize.

## docs/pages/blog/mui/2019.md <a id="2019_md"></a>

---
title: 2019 in review and beyond
date: 2020-01-25T00:00:00.000Z
description: 2019 was a great year for Material UI. It puts us on an exciting path to solve even greater challenges in the coming years!
authors: ['oliviertassinari']
tags: ['Company']
manualCard: true
---

2019 was a great year for Material UI.
It puts us on an exciting path to solve even greater challenges in the coming years!

## Growth

It's only with your trust that we could achieve the following outcomes in 2019. Thank you!

- 📦 From 2.2M to [3.2M](https://npm-stat.com/charts.html?package=%40material-ui%2Fcore&from=2018-11-30&to=2019-12-31) downloads per month (from 13% to [14%](https://docs.google.com/spreadsheets/d/1l5j3Xjtvm9XZtmb4ulLiWElQaXSlZlyCWT5ONrQMpBo/edit?usp=sharing) share of the React ecosystem).
- 📈 From 1.6M to 3.1M unique visitors per year on the documentation.
- ⭐️ From 43.1k to 53.3k stars, leave us [yours 🌟](https://github.com/mui/material-ui).
- 👨‍👩‍👧‍👦 From 1,064 to [1,581](https://github.com/mui/material-ui/graphs/contributors) contributors.
- 💰 Grew financial support by 1.76X in 2019, compared to 2018.
- 🏢 From 1.5 to 3 full-time equivalent developers, spread among multiple financially supported [core team members](/about/).

The numbers speak for themselves. 2019 was super exciting and made Material UI one of the most advanced open-source, React-based, UI component libraries!

## In review

When we started 2019, we were celebrating the launch of the **first stable release** of the framework and iterating to polish it (looking at the list of breaking changes, v3 is almost identical to v1).
We thought we were almost done, and that we had done the hardest part with the release of the stable version. All we would need to do going forward was to keep up with the Material Design guidelines and fix a couple of bugs.

We soon realized that we could do way more. It was just the beginning :D.
Some of the key factors:

- The results of the [2019 Developer Survey](https://mui.com/blog/2019-developer-survey-results/) have highlighted the immense potential for working on advanced components and features, especially for enterprise users.
  Developers are craving for a UI framework that they can learn once (for example few breaking changes, only one solution per problem) and use everywhere (for example comprehensive, customizable, high-quality).
- Bootstrap had successfully released [a theme store](https://themes.getbootstrap.com/).
  Following this approach opened an opportunity to capture a fraction of the value Material UI creates for its users, and funnel it back into R&D on the framework.
- The market for paid UI components is in the order of a couple of \$100m/year,
  with dozens of companies positioned in this market.
  While React is only one technology among many (jQuery, Angular, ASP.NET, Blazor, Vue, WPF, UWP, etc) with which to build a UI, but we believe that Web and React will become the dominant technology in the next 5 years for enterprises. Material UI is uniquely positioned to address this market with non-MIT features.
- Building UIs should be simpler, it still too slow and complex.
  Designers and developers should benefit from a more integrated experience.
- Every now and then, we witness the appearance of a new React UI component library built from scratch ([UXPin](https://adele.uxpin.com/) keeps track of some of them).
  And every time we asked ourselves, "what could have we done differently to empower this library"?
  We believe that starting from scratch, while maximizing freedom, is incredibly inefficient.
  Most UI libraries need the same features but are implemented with a wide spectrum of accessibility, developer experience, and overall design quality.
  We won't rest until we successfully unify these efforts. It's a long-term mission and will probably take years. The foundation will be the release of an un-styled version of our components.

## Achievements

- We have released [v4](/blog/material-ui-v4-is-out/).
- We have introduced many new components (some in the core, some in the lab):
  - [Autocomplete](/material-ui/react-autocomplete/)
  - [Backdrop](/material-ui/react-backdrop/)
  - [Breadcrumbs](/material-ui/react-breadcrumbs/)
  - [ButtonGroup](/material-ui/react-button-group/)
  - [Container](/material-ui/react-container/)
  - [Link](/material-ui/react-link/)
  - [Rating](/material-ui/react-rating/)
  - [Skeleton](/material-ui/react-skeleton/)
  - [Slider](/material-ui/react-slider/)
  - [TextareaAutosize](/material-ui/react-textarea-autosize/)
  - [TreeView](/x/react-tree-view/)
- We have fixed a significant number of [accessibility issues](https://github.com/mui/material-ui/issues?q=is%3Aissue+label%3Aaccessibility+is%3Aclosed).
- We have introduced global class names.
- We have migrated the whole codebase to hooks.
- We migrated all the demos to TypeScript (while also offering transpiled JavaScript demos).
- We introduced [native tree-shaking](/material-ui/guides/minimizing-bundle-size/) support.
- We introduced [built-in localization](/material-ui/guides/localization/).
- We removed a good number of external dependencies and increased the `features/bundle size` density.
- We introduced an [icon search page](/material-ui/material-icons/).
- We released a [store for MUI](https://mui.com/store/).

## Looking at 2020

2019 was great, 2020 is going to be even more exciting!
We will continue in the same direction.

### Survey

The Developer Survey we ran [last year](/blog/2019-developer-survey-results/) was so insightful that we plan to run it every year.
It's a great opportunity for us to adjust the strategy and to pause to analyze the outcome of the actions we took in the previous year.

### Open source roadmap

Most of the time we work in the open. Here's our [public roadmap](/material-ui/discover-more/roadmap/).
We plan to release a new major around the end of the year (v5).
We will promote components that are in the lab to the core, migrate to styled-components, and more.

### Store

We will increase the depth of content available with more themes and templates.
We have recently released a Sketch design library, and are planning to support Figma, and Adobe XD too.
For Framer, we have made the key components available as a Framer package.

### Enterprise

We plan to release an enterprise-class offering, starting with the data grid.
Enterprise features will build on the open-source version of the components.

### Hiring

We are looking for a full-time Software Developer to join us!

If you want to help us onboard more full-time developers in the team, [here are a couple of ways](/material-ui/getting-started/faq/#mui-is-an-awesome-organization-how-can-i-support-it).
Spreading the word to other developers who are looking for a great UI framework is also extremely helpful 🙌.

## docs/pages/blog/mui/2019-developer-survey-results.md <a id="2019-developer-survey-results_md"></a>

---
title: 'The 2019 Material UI Developer Survey: here's what we discovered'
description: Your feedback helps us to build better products. Here's what we learned about your needs in our annual survey.
date: 2019-03-16T00:00:00.000Z
authors: ['oliviertassinari', 'mbrookes']
tags: ['Developer Survey']
manualCard: true
---

While we are currently working on the upcoming release of Material UI v4, we need to prioritize our
roadmap for the coming year. To refine our focus, we launched a developer survey last month,
to which we received 734 contributions. Thank you for your participation!
The survey is now closed and this is a summary of the results.

The survey was broken into three sections, "Introduction", "About you" and "Your product".

## Introduction

Here we asked for the good, the bad and the ugly. Thankfully, it's mostly good, but we can focus
on the things that will make it even better.

### 1. How would you feel if you could no longer use Material UI?

<img src="/static/blog/2019-developer-survey-results/1.png" style="display: block; margin: 0 auto;" alt="Pie chart: 74.7% Very disappointed, 18.9% disappointed, 6.4% not disappointed." />

An overwhelming majority of respondents (over 93%), would be disappointed or very disappointed if
they could no longer use Material UI. The benchmark for "very disappointed" is 40%,
so we're on the right track. Don't worry, Material UI isn't going away any time soon –
we want to focus on making even more of you "very disappointed", as it were!

Curiously, the 6.4% who said they would _not_ be disappointed if they could no longer use
Material UI collectively gave a Net Promoter Score of 68%, which is
[higher than that of all respondents as a whole](#5-how-likely-is-it-that-you-would-recommend-material-ui-to-a-friend-or-colleague),
so we know they love us really. 😘

### 2. Who do you think would most benefit from Material UI?

This word cloud was generated with wordclouds.com.

<img src="/static/blog/2019-developer-survey-results/2.png" style="display: block; margin: 0 auto;" alt="Word cloud of who would benefit most" />

Developers, developers, developers! (And "anyone" and "everyone", apparently! ) This is understandable, given the
[job role demographic](#7-which-of-the-following-best-describes-your-current-job-role)
of the majority of respondents. We'll continue to work on the developer experience, making it
easier to get started with, use, and customize Material UI.

### 3. What is the main benefit you receive from Material UI?

<img src="/static/blog/2019-developer-survey-results/3.png" style="display: block; margin: 0 auto;" alt="Word cloud of the main benefit of Material UI" />

The responses variously commented on being able to focus on the business logic, time saved,
good looking components, ease of use, design consistency, good documentation.
We'll make sure that we continue to do more of the things that benefit you the most.

### 4. How can we improve Material UI for you?

We have grouped the answers into different categories.
The prefix corresponds to the number of times the concern was mentioned.
It's sorted descending, with the most important concerns first:

- 135 **More components:**

  - 56 Non-specific
  - 21 Date picker
  - 10 Autocomplete
  - 9 Layout
  - 8 Table++
  - 5 Carousel
  - 5 Slider
  - 3 Video
  - 2 Calendar
  - 2 Menu nesting
  - 2 List - draggable
  - 1 Tree view
  - 1 Color picker
  - 1 Dense mode
  - 1 For landing pages
  - 1 Group avatar
  - 1 Image gallery
  - 1 Image picker
  - 1 Menu - dropdown
  - 1 Mobile
  - 1 Rating
  - 1 Timeline
  - 1 Transfer

- 50 **Better customization:**

  - 23 Non-specific
  - 15 Docs
  - 8 Easier
  - 3 Theme
  - 1 Colors

- 36 **Better documentation:**

  - 11 Non-specific
  - 7 More examples
  - 5 Beginner tutorials
  - 4 Video lessons
  - 2 API pages
  - 2 Icon explorer
  - 1 Best practices
  - 1 Customization
  - 1 Global CSS
  - 1 Demo source scroll issue
  - 1 Server-side rendering

- 31 **TypeScript:**

  - 14 Non-specific
  - 13 Migrate more demos
  - 3 withStyles -> makeStyles
  - 1 Rewrite

- 24 **Performance:**

  - 23 Non-specific
  - 1 Table

- 19 **Bundle size**
- 17 **Material Design Update**
- 16 **styled-components:**

  - 10 Support
  - 6 Migration

- 14 **Fewer breaking changes**
- 10 **More page layout examples**
- 9 **Theme:**

  - 3 More colors
  - 3 Live editor
  - 1 Non-material font example
  - 2 Responsive typography

- 8 **React.StrictMode support**
- 8 **React Native support**
- 6 **Accessibility:**

  - 4 Non specific
  - 1 Docs
  - 1 SkipNav

- 6 **Hooks at 100%**
- 4 **Animations**
- 4 **Long Term Support**
- 4 **Simplification**
- 3 **Gatsby plugin**
- 3 **i18n**
- 3 **Premium themes**
- 3 **Showcase, design inspiration**
- 2 **Clear Roadmap**
- 2 **Preact support**
- 2 **Simpler: closer to DOM nodes**
- 2 **Styleless components**
- 1 **Web component integration example**
- 1 **Collect user feedback**
- 1 **Non-Material Design theme example**
- 1 **Right to left**
- 1 **Storybook addons**
- 1 **Styles: better docs**
- 1 **Testing**

### 5. How likely is it that you would recommend Material UI to a friend or colleague?

<figure style="margin-inline-start: 0;">
  <img src="/static/blog/2019-developer-survey-results/5a.png" style="display: block; margin: 0 auto;" alt="Bar chart of raw data" />
  <figcaption style="font-style: italic; text-align: center;">Raw data.</figcaption>
</figure>
<br />
<figure style="margin-inline-start: 0;">
<img style="display: block; margin: 0 auto;" src="/static/blog/2019-developer-survey-results/5b.png" style="display: block; margin: 0 auto;" alt="Pie chart: 70.6% promoters, 24.8% neutrals, 4.6% detractors" />
  <figcaption style="font-style: italic; text-align: center;">Result.</figcaption>
</figure>

Developers gave Material UI a [Net Promoter Score](https://en.wikipedia.org/wiki/Net_Promoter)
(promoters less detractors) of 66%. Given the NPS range of -100 to +100, a "positive" score or NPS
above 0 is considered "good", +50 is "Excellent", and above 70 is considered "world class."

## About you

### 6. How did you hear about Material UI?

Multiple options were allowed.

| Channel(s)                  | Number |
| :-------------------------- | -----: |
| Search                      |    344 |
| Word of mouth               |    112 |
| Search, Word of mouth       |     47 |
| Search, Social              |     25 |
| Social                      |     22 |
| Blog                        |     14 |
| Search, Word of mouth, Blog |     11 |

<br /><br />
<img src="/static/blog/2019-developer-survey-results/6.png" style="display: block; margin: 0 auto;" alt="Bar chart: 74.3% search, 29.6% word of mouth, 8.2% Social, 4.3% blog." />

### 7. Which of the following best describes your current job role?

<img src="/static/blog/2019-developer-survey-results/7.png" style="display: block; margin: 0 auto;" alt="Bar chart: 358 Full-stack developers, 189 Frontend developers, 103 Entrepreneurs, 31 Beginners, 42 Other" />

No huge surprises here!

### 8. How big is your organization?

<img  src="/static/blog/2019-developer-survey-results/8.png" style="display: block; margin: 0 auto;" alt="Bar chart: 61 Hobby, 98 Self-employed, 181 x 2-10, 167 x 11-50, 126 x 51-500, 89 x 500 +" />

Material UI is most popular with small to medium sized organisations,
perhaps because beyond a certain size, organizations have teams building their own design system and framework.
We want to continue to make it easy to use the component logic of Material UI while allowing
designers to give it a bespoke look and feel for their organization.

### 9. How long have you been developing with JavaScript

<img src="/static/blog/2019-developer-survey-results/9.png" style="display: block; margin: 0 auto;" alt="Bar chart: 26 x I'm just getting started!, 43 x 6 months +, 150 x 1 year +, 179 x 3 years +, 155 x 5 years, 82 x 10 years +, 47 x 15 years +" />

A nice bell curve, with the majority of developers having 1 to 5 years experience with JavaScript.

### 10. How long have you been developing with React?

<img src="/static/blog/2019-developer-survey-results/10.png" style="display: block; margin: 0 auto;" alt="Bar chart: 99 x I'm just getting started!, 77 x 6 months +, 301 x 1 year +, 171 x 3 years +, 32 x 5 years - bleeding edge baby!" />

### 11. How long have you been developing with Material UI?

<img src="/static/blog/2019-developer-survey-results/11.png" style="display: block; margin: 0 auto;" alt="Bar chart: 160 x I'm just getting started!, 147 x 6 months +, 293 x 1 year +, 71 x 3 years +, 11 x Four years + – I'm a pioneer!" />

We missed a trick by not including "2 years +" here, so "1 year +" looks stacked.
The number of users of Material UI continues to grow at a steady pace, and once on board, many
developers stick with it.

### 12. What were you primarily using before Material UI?

<img src="/static/blog/2019-developer-survey-results/12.png" style="display: block; margin: 0 auto;" alt="Bar chart: 55% Bootstrap, 18% Custom, 12% Other, 7% Semantic-IU, 6% Materialize, 3% React Toolbox" />

Given its relative popularity, and the move from CSS / HTML / jQuery towards front-end frameworks,
it should come as no big surprise to see that the majority of respondents were previously using Bootstrap.
Custom solutions have also been replaced by Material UI as your go-to UI library, along with a
long-tail of other frameworks.

### 13. How many Material UI based projects have you built?

<img src="/static/blog/2019-developer-survey-results/13.png" style="display: block; margin: 0 auto;" alt="Pie chart: 10.7% I'm just getting started, 23.5% 1, 52.5% 2-5, 11.1% 6-10, 2.2% 10+" />

Over three quarters of you have built two or more projects with Material UI, with 13.3% having six
or more projects under your belt. The 2.2% with ten or more, we salute you!

## Your product

### 14. What are you building?

Multiple options were allowed.

- Dashboard & admin: 70%
- UI components (design system): 40%
- Business & corporate pages: 35%
- Landing pages (product): 33%
- e-commerce: 14%
- Portfolio & resume: 12%
- Blog: 8%

Dashboards are at the top of the heap, and we've long known that many of you are building internal
systems that can't feature in [the showcase](/material-ui/discover-more/showcase/). Let us know by opening a PR
if you're bucking that trend, and have something sparkly to share! And if you're in the 40% building UI
components, we'd be happy to give you a shout out in the [related projects](/material-ui/discover-more/related-projects/)
section.

### 15. What "delivery mechanism" are you using?

Multiple options were allowed.

- Web app (for example create react app): 92%
- Progressive web app (with service worker): 25%
- Server-side rendering 14%
- Static web site, hosted on a CDN (for example Gatsby): 13%
- Desktop app (for example Electron): 12%
- Native mobile app (for example Cordova): 6%

### 16. Who are you building it for?

<img src="/static/blog/2019-developer-survey-results/16.png" style="display: block; margin: 0 auto;" alt="Pie chart: 54,3% for my company, 24.9% for a client, 15.2% as a side project, 5.6% more than one of these." />

### 17. Which JavaScript framework are you using, if any?

Multiple options were allowed.

- Create React App: 75%
- none: 17%
- Next.js: 12%
- Gatsby: 8%

Server-side rendering isn't yet very popular.
As the React ecosystem matures, we might see a big push of server-side rendering in the coming months.

### 18. What styling system are you using?

Multiple options were allowed.

- @mui/styles: 85%
- Styled components: 30%
- Good old CSS (+sass, less, etc): 24%
- CSS Modules (+sass, less, etc): 16%
- Emotion: 4%

Traditional CSS users are still prevalent (24% + 16%).
The components customization `classes` API was designed for these people.
It's also why we allow the generation of deterministic class names (_MuiButton-root_ instead of _jss113_).

However, styled components is popular. We will work on better supporting it.

## Conclusion

This data is **incredibly valuable** for our team.
Again, thank you for participating!
We want to work on the problems that resonate the most with our users.
[It's clear](#4-how-can-we-improve-material-ui-for-you) that we should:

1. Support more components
2. Improve the customization
3. Improve the documentation
4. Improve the static typings
5. Reduce the overhead of the library

**We will update [our ROADMAP](/material-ui/discover-more/roadmap/) in the coming days**.
We will run a similar survey next year to keep track of our progress.

If you want to continue to influence our roadmap, please upvote 👍 the issues you are the most interested in on GitHub.

<img src="/static/blog/2019-developer-survey-results/vote.gif" style="display: block; margin: 0 auto;" alt="How to upvote on GitHub" />
<p class="blog-description">Help us prioritize by upvoting.</p>

## docs/pages/blog/mui/2020-introducing-sketch.md <a id="2020-introducing-sketch_md"></a>

---
title: Introducing Material UI for Sketch
description: Today, we're excited to announce the introduction of official Sketch symbols for Material UI.
date: 2020-03-30T00:00:00.000Z
authors: ['oliviertassinari']
tags: ['Material UI', 'Product']
manualCard: true
---

Today, we're excited to introduce the Sketch symbols 💎 for Material UI.

[![preview](/static/blog/2020-introducing-sketch/product-preview.png)](https://mui.com/store/items/sketch-react/?utm_source=blog&utm_medium=blog&utm_campaign=introducing-sketch)

<p class="blog-description">Available on our <a href="https://mui.com/store/items/sketch-react">store</a></p>

The UI kit contains all the Material UI components with states and variations which gives 1,500+ unique elements. All components are designed with the most up to date release.

We dream of a world where designers and developers can share the same tools. We wish to streamline the creation process of great UIs.
This new product brings you one step closer to this long term goal. It enables designers to provide developers close to production "handoffs". It aims to **maximize efficiency and consistency**.

## Why

### Frequent requests

Over the last few months, we have seen a growing number of designers asking for these Sketch symbols.
For instance, there is a [Stack Overflow question](https://stackoverflow.com/questions/38834629/material-ui-sketch-files) with over 4,000 views. It has been a common request on X: [one](https://x.com/TimoMajerski/status/1144503789619224578), [two](https://x.com/jonminori/status/1141121330156310528), [three](https://x.com/ProfessorXavior/status/1196522875706056705), [etc](https://x.com/JeffreyKaine/status/1133435042259120132).

### No great alternatives

For a long time, we have ignored the problem. We were recommending users to try alternatives out. However, we realized that it wasn't a great answer. There were no good solutions out there:

- **Sketch** has [some symbols](https://i.stack.imgur.com/vEEAA.png) for Material Design. Unfortunately, they cover <30% of the components available in Material UI, use an outdated version of the specification, and focus on mobile (leaving desktop behind).
- **Material Design** had a [Sketch plugin](https://m2.material.io/resources/theme-editor/).
  Unfortunately, it was recently retired, was supporting fewer components than Material UI, and didn't use the same wording/structure as Material UI that made it harder to move from design to implementation.
- Anything else is paid.

### Gain efficiency

No matter what your role, you'll be more efficient with these assets:

**UI / UX Designers 💅**

Save time using this large library of UI components, icons and styles to deliver your work faster. You can customize the kit however you want to match your product's brand.

**Product managers / Entrepreneurs 🧪**

Create MVPs efficiently and save hundreds of hours on UI Design. This is a great place to start if your product or brand needs a design system. Equip your team with this library for Sketch and build consistent products faster.

**Developers 🛠**

Gain in autonomy, design beautiful, consistent and accessible interface without relying on designers. You can preview how it will look before coding it.
The UI kit was created specifically for Material UI, a popular React UI library with a comprehensive set of components.

## See it in action

The following video demonstrates how the symbols can be used to design an invoice page.

<iframe style="width: 100%; max-width: 648px;" height="364" src="https://www.youtube.com/embed/DTU6r_VE2C4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Sketch Cloud preview: https://mui.com/store/previews/sketch-react/.

## More tools

According to a [recent user survey](https://medium.com/google-design/state-of-design-systems-2019-ff5f26ada71) ran by the Material Design Team, Sketch is the most popular tool used by teams to manage design systems. However, it's not the only tool.

![preview](/static/blog/2020-introducing-sketch/design-tools.png)

<p class="blog-description">Popular tools used to manage Design Systems (n=1762)</p>

We are working on the support of more popular tools.
We have recently released the support of Framer X for Material UI.
We plan to release the support of **Figma** in the coming weeks. You can subscribe to the [newsletter of the store](https://mui.com/store/#subscribe) to be notified when available.

## Features

You can learn more about the features available on the [Sketch page details](https://mui.com/store/items/sketch-react/?utm_source=blog&utm_medium=blog&utm_campaign=introducing-sketch) of the symbols.

## docs/pages/blog/mui/2020-q2-update.md <a id="2020-q2-update_md"></a>

---
title: Q2 2020 Update
description: An update on our mission for Q2 2020.
date: 2020-07-17T00:00:00.000Z
authors: ['oliviertassinari']
tags: ['Company']
manualCard: true
---

This update covers our progress over the last three months, and what we aim to achieve in the coming months.

## Product

Here are the most significant improvements since March 2020:

- 🚧 Work has started on [the next major version: v5](https://github.com/mui/material-ui/issues/20012).<br />
  The last 14 months have been spent focusing on improving the library under the v4.x development branch, while not introducing any breaking changes. During this period we have identified several important areas for improvement. While the absence of breaking changes is a significant time-saver for developers, it also limits the scope of the problems that can be solved and the quality of the solutions. We're excited about what comes next!<br /><br />
  You can find the documentation for the next version at https://mui.com/. The next 6-8 months will see weekly releases as always, following [the roadmap](https://github.com/mui/material-ui/issues/20012) and [milestone](https://github.com/mui/material-ui/milestone/35).

- 📍 The icons package has been updated with changes made by Google, leading to [200+ new icons](https://mui.com/material-ui/material-icons/).

  <img src="/static/blog/2020-q2-update/icons.png" alt="icons" style="width: 615px; margin-bottom: 24px;" />

- 🎨 [Figma assets](https://mui.com/store/items/figma-react/) for Material UI extend the support for design tools beyond Sketch.

  <a href="https://mui.com/store/items/figma-react/"><img src="/static/blog/2020-q1-update/figma.png" alt="figma" style="width: 160px; margin-bottom: 24px;" /></a>

  Adobe XD and Framer support are also up for consideration if they attract a significant audience, but not until we've polished the Sketch and Figma assets.

- 🔄 `LoadingButton` – [a new component in the lab](https://mui.com/material-ui/react-button/#loading-button). This work is influenced by the [concurrent UI patterns](https://17.reactjs.org/docs/concurrent-mode-patterns.html) presented by the React team.

  <img src="/static/blog/2020-q2-update/loading.gif" alt="loading" style="margin-bottom: 24px;" />

- ⚛️ We have made **all** component props available in IntelliSense. This is complementary to the `propTypes` and API pages in the documentation.

  ![props](/static/blog/2020-q1-update/props.png)

- ⏰ A new [`Timeline` component](/material-ui/react-timeline/) joins the lab.

  <img src="/static/blog/2020-q2-update/timeline.png" alt="timeline" style="width: 244px; margin-bottom: 24px;" />

- 📣 We have analyzed and published the results of the "Material UI Developer Survey 2020". If you haven't read it yet, you can follow this link to [read it in detail](/blog/2020-developer-survey-results/). It contains a lot of interesting insights that will shape the future of the library and company. Thanks for the contributions! ❤️
- 🇨🇳🇧🇷 The non-API documentation has been fully translated to Chinese and Brazilian, thanks to the collaboration of [Danica Shen](https://github.com/DDDDDanica), [Yan Lee](https://github.com/AGDholo), and [Jairon Alves Lima](https://github.com/jaironalves), native speakers from the community 🙏.

  <img src="/static/blog/2020-q2-update/chinese.png" alt="chinese" style="width: 146px; padding-right: 3px; box-sizing: content-box;" />

  <img src="/static/blog/2020-q2-update/brazilian.png" alt="brazilian" style="width: 152px; margin-bottom: 24px;" />

  After English, Chinese, and Brazilian, the languages that would benefit the most from translation are **Russian** and **Spanish**.<br />
  Feel free to [get stuck into](https://crowdin.com/project/material-ui-docs) if you are a native speaker and able to give a hand with either of these two languages.

- 🗂 A new extension of the Tab API [in the lab](/material-ui/react-tabs/#experimental-api) implements accessible tabs following [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) authoring practices.

```jsx
<TabContext value={value}>
  <TabList onChange={handleChange} aria-label="simple tabs example">
    <Tab label="Item One" value="1" />
    <Tab label="Item Two" value="2" />
    <Tab label="Item Three" value="3" />
  </TabList>
  <TabPanel value="1">Item One</TabPanel>
  <TabPanel value="2">Item Two</TabPanel>
  <TabPanel value="3">Item Three</TabPanel>
</TabContext>
```

- 📆 On the [date picker](https://mui.com/x/react-date-pickers/):

  - A new `renderInput` API which matches that of the autocomplete component has been added.
  - The input mask UX has been improved.
  - Support for `value={null}` has been added.
  - Desktop vs mobile detection has been improved by using the pointer capabilities instead of the screen dimension.
  - Accessibility has been improved.
  - Consistency between the date pickers and the other components of the library has been improved.

## Company

### Growth between Q1 2020 and Q2 2020

- 📦 From 4.8M to 5.1M downloads per month on npm.
- ⭐️ From 56.2k to 59.0k stars, leave us yours 🌟.
- 👨‍👩‍👧‍👦 From 1,720 to 1,825 contributors on GitHub.
- 💰 Grew monthly financial support by 46%.
- 🏢 Headcount remains the same.

## Our roadmap intent for Q3 2020

We'll do our best, no guarantee!

- ⚙️ To make significant progress with the v5 roadmap.

- 🌏 Translate the API pages, for instance, the [Alert API](https://mui.com/api/alert/) can only be consumed in English.

- 📆 Migrate the date picker components to the main repository to ensure high consistency with the core components. Keep investing in the component to make it part of the v5 release schedule.

- 👩‍🎨 We will work with a design agency to do the branding of the company, redo the homepage, do the marketing pages of the enterprise version of the library, improve the documentation, introduce new themes (as alternatives to Material Design).

- ❓ Please upvote [GitHub issues](https://github.com/mui/material-ui/issues) if you want something specific. The number of 👍 helps us to prioritize.

### Company

These are objectives, no guarantees:

- 🏢 We will [hire](/careers/) 3 full-time roles in the team.

  - One person on the open-source side to focus on the design system problem (unstyled, theming, styling, etc.): ✅ starting in two months.
  - One person on the enterprise side to consolidate the development of the advanced components: 🚧 Work in progress.
  - One person on a role yet to defined: 🚧 Work in progress.

- 🏝 We will run a company-wide team retreat if COVID-19 allows it.
- 📈 We will put structures internally to prepare the next step of growth.

### Enterprise components

- ⌗ Make available a first alpha version of our advanced data grid component as part of the enterprise bundle.
  You can already play with an early version.
- 📆 Make available a first alpha version of the date range picker as part of the enterprise bundle.
  You can already play with an early version.

## docs/pages/blog/mui/2020.md <a id="2020_md"></a>

---
title: 2020 in review and beyond
description: 2020 has been another great year, not only for MUI, but also for the ecosystem.
date: 2020-12-31T00:00:00.000Z
authors: ['oliviertassinari', 'mbrookes']
tags: ['Company']
manualCard: true
---

2020 has been another great year, not only for MUI, but also for the ecosystem.
We have taken on ambitious challenges and started to scale the project.

## Growth

It's only with your trust that we could achieve the following outcomes in 2020. Thank you!

- 📦 From 3.2M to [6.4M](https://npm-stat.com/charts.html?package=%40material-ui%2Fcore&from=2019-11-30&to=2020-12-31) downloads per month (from 14% to [18%](https://docs.google.com/spreadsheets/d/1l5j3Xjtvm9XZtmb4ulLiWElQaXSlZlyCWT5ONrQMpBo/edit?usp=sharing) share of the React ecosystem).
- 📈 From 3.1M to 4.6M unique visitors per year on the documentation.
- ⭐️ From 53.3k to 63.8k stars, leave us [yours 🌟](https://github.com/mui/material-ui).
- 👨‍👩‍👧‍👦 From 1,581 to [2,052](https://github.com/mui/material-ui/graphs/contributors) contributors.
- 💰 Grew financial support by 2.1X in 2020, compared to 2019.
- 🏢 From 3 to 6 full-time equivalent developers, spread among multiple financially supported [core team members](/about/).

The numbers speak for themselves. We have reproduced the [traction we got in 2019](/blog/2019/#growth).

## In review

When we started 2020, we were celebrating the launch of many new components.
We were busy building features to match feature parity with Ant Design, and more importantly, acting on the top feedback we got doing the [first user survey](/blog/2019-developer-survey-results/).

We have spent the year continuing in the same direction, polishing past components and introducing new ones. We ran a [second user survey](/blog/2020-developer-survey-results/), 15 months after the first one. It was a great opportunity to evaluate the effectiveness of our past efforts. For instance, we were very pleased to see that the slider component was almost a solved problem, and that the TypeScript definitions significantly improved. We also noticed the emergence of trends:

- The more new components we add, the more developers want new ones. For instance, we rarely heard about the need for providing charts in 2019, it's now one of the top requested. In our last survey, we had 10% more requests for new components, even though, we brought new ones. We were surprised, it was counter-intuitive to us.
- The pain around the customization of the components is growing. We also frequently hear that there is a steep learning curve for using `@mui/styles`. We are reaching a larger audience used to raw CSS without extensive knowledge of specificity.
- The demand for Material Design is stable, no longer growing. At the same time, the request for new ready-to-use themes is up. Our strategy around providing building blocks to build custom designed UI starts to gain traction.

We have started to leverage these trends as opportunities in the next version of the library: v5.

## Achievements

We have achieved most of what we could have hoped for.

- The most important, we have welcome 3 members in the company: [Damien](/blog/spotlight-damien-tassone/), [Marija](/blog/marija-najdova-joining/), and [Danail](/blog/danail-hadjiatanasov-joining/).
- We have made significant progress with [v5](https://mui.com/). We have made half the breaking changes planned. We have migrated our [first component](https://v4.mui.com/components/slider/) to the new style architecture (emotion by default, adapter for styled-components, and unstyled).
- We have introduced new components (some in the core, some in the lab):
  - [Alert](https://v4.mui.com/components/alert/)
  - [DataGrid](https://v4.mui.com/components/data-grid/)
  - [DatePicker](https://v4.mui.com/components/pickers/)
  - [LoadingButton](https://mui.com/material-ui/react-button/#loading-button)
  - [Timeline](https://v4.mui.com/components/timeline/)
  - [FocusTrap](https://mui.com/base-ui/react-focus-trap/)
- We have fixed most of the issues with the [Autocomplete](https://v4.mui.com/components/autocomplete/). We have received an overwhelming interest in the component. It was impressive to see.
- We have completed the work for [strict mode](https://react.dev/reference/react/StrictMode) support.
- We have increased the adoption of TypeScript in the codebase. We don't plan a dedicated migration but to write new code in TypeScript, as we go.
- We have migrated most of the tests from Enzyme to [Testing Library](https://testing-library.com/).
- We have modernized MUI System, introducing an [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/) to be used in all the core components.
- We have added support for [Figma](/store/items/figma-react/) and [Adobe XD](/store/items/adobe-xd-react/).
- We have released the first Enterprise component in an alpha version: [XGrid](https://v4.mui.com/components/data-grid/#commercial-version).

## Looking at 2021

2020 was great, 2021 is going to be even more exciting!
We will continue in the same direction, it's still **[day one](https://www.sec.gov/Archives/edgar/data/1018724/000119312517120198/d373368dex991.htm)**. Here is a breakdown of our [roadmap](https://v4.mui.com/discover-more/roadmap/).

### Branding

Up until now, we never had a mindful reflection on what the branding of Material UI should be.
We picked a color from the 2014 Material Design palette, and that's it.
The [mui.com](https://mui.com/) marketing website will soon wear a brand new style! We need to create our own identity, distinct from Material Design.

### MUI X

We started to deliver advanced React components in 2020 with the data grid, including a [commercial version](https://v4.mui.com/components/data-grid/) and the beginning of a [date range picker](https://mui.com/x/react-date-pickers/getting-started/).
We will double down on these existing components as long as necessary to have them find the market.

By the end of 2021, we aim to have released these components as stable, implement all the [features planned](https://v4.mui.com/components/data-grid/getting-started/#feature-comparison), and at least double the size of the team.

### Material UI v5

We will release the next major iteration of the library. A highlight of the key improvements coming ✨:

- Polish and promote most of the components that were in the lab in v4 to the core.
- A new style engine. Migrate from JSS to Emotion (default) and styled-components's `styled` API.
- Improve customizability. Add new powers to the theme with dynamic color & [variant](https://mui.com/material-ui/customization/typography/#adding-amp-disabling-variants) support. Add a new [`sx` prop](https://mui.com/system/getting-started/the-sx-prop/) for quick customizations to all the components. Expose global class names. Deprecate the `makeStyles` and `withStyles` API.
- Breaking changes on the API to make it more intuitive.
- Add full support for React strict mode. We recommend to enable it.
- Improve the performance of MUI System by a x3-x5 [factor](https://github.com/mui/material-ui/issues/21657#issuecomment-707140999).
- Reduce bundle size: split IE11 into a different bundle [-6kB](https://github.com/mui/material-ui/pull/22814#issuecomment-700995216), migrate to Emotion [-5kB](https://github.com/mui/material-ui/pull/23308#issuecomment-718748835), Popper.js v2 upgrade [-700B](https://github.com/mui/material-ui/pull/21761#issuecomment-657135498).
- Improve the documentation website: search shortcut, page rating, fast material icons copy button, etc.

And [much more](https://github.com/mui/material-ui/issues/20012).

### A second theme

While Material Design is a predominant design choice for building rich client-side applications, it's not the only popular design trend. We plan to provide a [second theme](https://github.com/mui/material-ui/issues/22485) to expand the range of use cases for MUI, striking a balance between:

- alignment with the best-looking design trends of hot startups in the US.
- optimization of its usage for rich client-side applications while keeping it good enough for landing pages.
- simplicity of the design for allowing simpler customizations.
- complementarity with Material Design.

It will be built on top of the unstyled components.

### Unstyled

While the completion of the unstyled components was originally part of the v5 milestone,
we will likely finish this effort independently.
Outside of the requirement to introduce breaking changes on the component customization API, for example from `PaperProps` to `slotProps`, [RFC #20012](https://github.com/mui/material-ui/issues/21453), we can work on unstyled at the same time we make progress with the second theme. The two efforts should go hand in hand.

### Scale

If we sustain the current growth rate, we should be able to double the size of the team, from 6 to over 10 members in the company without raising. While we will focus on strengthening all the efforts that we have started, it should start to give us room to take on significantly more ambitious problems guided by the following foundations:

- React dominance in the UI development landscape will increase and stay for a very long time.
- Developers are looking to build faster and more appealing UIs.
- Low-code will progressively become mainstream for professional developers and knowledge workers.

If like us, you are excited about bringing joy to developers and enabling more people to build apps, check our positions, [we are hiring](/careers/)!

See you in 2021 🚀

## docs/pages/blog/mui/2020-developer-survey-results.md <a id="2020-developer-survey-results_md"></a>

---
title: 'The 2020 Material UI Developer Survey: here's what we discovered'
description: Your feedback helps us to build better products. Here's what we learned about your needs in our annual survey.
date: 2020-06-27T00:00:00.000Z
authors: ['mnajdova', 'oliviertassinari', 'mbrookes']
tags: ['Developer Survey']
manualCard: true
---

Continuing the tradition from last year, we launched a Developer Survey a few months ago, to which we received 1488 responses. This is twice as many as last year (734), so we thank you all for your participation!
The survey is closed and we can now give a detailed summary of the results.

Like last year, the survey was again broken into three sections: ["Introduction"](#Introduction), ["About you"](#about-you) and ["Your product"](#your-product).

## Introduction

In this section, we wanted to hear what developers think is going well, what we should keep doing, and which areas need improving to make the library even better.

### 1. How would you feel if you could no longer use Material UI?

<img src="/static/blog/2020-survey/1.png" style="width: 796px; margin-top: 16px; margin-bottom: 16px;" alt="Pie chart: 73.3% Very disappointed, 21.3% somewhat disappointed, 5.4% not disappointed." />

Similar to last year, over 94% of the respondents would be disappointed if they could no longer use Material UI, which is very encouraging. We will keep working hard to hopefully move more of you into the "very disappointed" category!

The number of respondents who would not be disappointed has moved down from 6.5% to 5.4%, which is technically a 17% improvement! 🙂 We'd love to understand more about those who use Material UI, but would happily use other solutions, so a follow-up question might be needed next year.

### 2. How likely is it that you would recommend Material UI to a friend or colleague?

<img src="/static/blog/2020-survey/2a.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 0.20% - 1, 0% - 2, 0.20% - 3, 0.20% - 4, 1.02% - 5, 1.97% - 6, 8.71% - 7, 22.52% - 8, 20.88% - 9, 44.29% - 10" />
<img src="/static/blog/2020-survey/2b.png" style="width: 796px; margin-top: 16px; margin-bottom: 16px;" alt="Pie chart: 73.3% Very disappointed, 21.3% somewhat disappointed, 5.4% not disappointed." />

As last year, we again calculated the [Net Promoter Score](https://en.wikipedia.org/wiki/Net_Promoter)
(promoters less detractors). This year it is again a pretty high number 61.54%! (As the values for NPS range between -100 and +100, a "positive" score is considered "good", greater than 50 is "excellent", and above 70 is considered "world class").

### 3. Who do you think would most benefit from Material UI?

<img src="/static/blog/2020-survey/3.png" style="width: 796px; margin-top: 16px; margin-bottom: 16px;" alt="Word cloud of who would benefit most" />

<p class="blog-description">This word cloud was generated with wordclouds.com.</p>

Developers are again at the center of our universe 🙂 (And "people" and "teams" in general, of course!) This is understandable, given the [job role demographic](#8-which-of-the-following-best-describes-your-current-job-role)
of the majority of respondents. We will push hard on making the experience for you even better over the next year.

### 4. What is the main benefit you receive from Material UI?

<img src="/static/blog/2020-survey/4.png" style="width: 796px; margin-top: 16px; margin-bottom: 16px;" alt="Word cloud of the main benefit of Material UI" />

The responses to this question are a very clear indicator to us about what we need to continue to do more of. Some of the most common points were: the range of components, ease of use, documentation quality, as well as the design. We will, of course, continue to work on all of these.

### 5. How can we improve Material UI for you?

As the answers to these questions were pretty different, we grouped them into different categories and counted the different number of times the concern was mentioned. You can see all of them sorted in descending order:

<!-- vale MUI.CorrectReferenceAllCases = NO -->

<style>th { text-align: left; border-bottom: 3px solid !important; }</style>

<table>
  <tr><th style="width: 40px;">306</th><th style="width: 700px;">more components</th><tr>
  <tr><td>202</td><td>more components - ?</td><tr>
  <tr><td>15</td><td>more components - data grid</td><tr>
  <tr><td>12</td><td>more components - carousel</td><tr>
  <tr><td>12</td><td>more components - charts</td><tr>
  <tr><td>10</td><td>more components - lab to core</td><tr>
  <tr><td>10</td><td>more components - upload</td><tr>
  <tr><td>9</td><td>more components - icons</td><tr>
  <tr><td>6</td><td>more components - big calendar</td><tr>
  <tr><td>5</td><td>more components - layout</td><tr>
  <tr><td>4</td><td>more components - navbar</td><tr>
  <tr><td>4</td><td>more components - nested menu</td><tr>
  <tr><td>2</td><td>more components - rich text editor</td><tr>
  <tr><td>2</td><td>more components - splitter</td><tr>
  <tr><td>1</td><td>more components - masonry</td><tr>
  <tr><td>1</td><td>more components - nav bar</td><tr>
  <tr><td>1</td><td>more components - numberpad</td><tr>
  <tr><td>1</td><td>more components - onboarding</td><tr>
  <tr><td>1</td><td>more components - prompt</td><tr>
  <tr><td>1</td><td>more components - scrollspy</td><tr>
  <tr><td>1</td><td>more components - swappable tabs</td><tr>
  <tr><td>1</td><td>more components - timeline</td><tr>
  <tr><td>1</td><td>more components - video player</td><tr>
  <tr><td>1</td><td>more components - virtualization</td><tr>
  <tr><td>1</td><td>more components - drag and drop</td><tr>
  <tr><td>1</td><td>more components - dropdown</td><tr>
  <tr><td>1</td><td>more components - image</td><tr>
  <tr><th>189</th><th>customization</th><tr>
  <tr><td>85</td><td>customization - easier</td><tr>
  <tr><td>22</td><td>customization - docs</td><tr>
  <tr><td>16</td><td>customization - dynamic color & variant</td><tr>
  <tr><td>15</td><td>customization - improve custom themes</td><tr>
  <tr><td>13</td><td>customization - provide more themes (not just Material Design)</td><tr>
  <tr><td>11</td><td>customization - ?</td><tr>
  <tr><td>9</td><td>customization - unstyled components</td><tr>
  <tr><td>8</td><td>customization - support system in all components</td><tr>
  <tr><td>8</td><td>customization - theme editor (visual tool)</td><tr>
  <tr><td>2</td><td>customization - theme gallery (coming from the community)</td><tr>
  <tr><th>155</th><th>docs</th><tr>
  <tr><td>46</td><td>docs - ?</td><tr>
  <tr><td>45</td><td>docs - more examples</td><tr>
  <tr><td>33</td><td>docs - more templates</td><tr>
  <tr><td>16</td><td>docs - beginner friendly</td><tr>
  <tr><td>8</td><td>docs - smaller demos</td><tr>
  <tr><td>8</td><td>docs - tutorials</td><tr>
  <tr><td>3</td><td>docs - api integration with components</td><tr>
  <tr><td>2</td><td>docs - better search</td><tr>
  <tr><td>2</td><td>docs - spanish</td><tr>
  <tr><td>1</td><td>docs - chinese</td><tr>
  <tr><td>1</td><td>docs - translations</td><tr>
  <tr><td>1</td><td>docs - detailed api</td><tr>
  <tr><td>1</td><td>docs - easier discoverability of components</td><tr>
  <tr><td>1</td><td>docs - generated DOM</td><tr>
  <tr><td>1</td><td>docs - japanese</td><tr>
  <tr><td>1</td><td>docs - more realistic examples</td><tr>
  <tr><td>1</td><td>docs - nested props</td><tr>
  <tr><td>1</td><td>docs - plugins</td><tr>
  <tr><td>1</td><td>docs - ssr</td><tr>
  <tr><th>64</th><th>performance</th><tr>
  <tr><td>31</td><td>performance - ?</td><tr>
  <tr><td>32</td><td>performance - bundle size</td><tr>
  <tr><td>1</td><td>performance - DOM size</td><tr>
  <tr><th>56</th><th>styles</th><tr>
  <tr><td>19</td><td>styles - styled components</td><tr>
  <tr><td>7</td><td>styles - docs</td><tr>
  <tr><td>5</td><td>styles - simpler</td><tr>
  <tr><td>4</td><td>styles - ?</td><tr>
  <tr><td>3</td><td>styles - CSS syntax</td><tr>
  <tr><td>3</td><td>styles - better dark/light switch</td><tr>
  <tr><td>3</td><td>styles - emotion</td><tr>
  <tr><td>3</td><td>styles - performance</td><tr>
  <tr><td>2</td><td>styles - agnostic to engine</td><tr>
  <tr><td>2</td><td>styles - CSS modules</td><tr>
  <tr><td>2</td><td>styles - utility class names</td><tr>
  <tr><td>1</td><td>styles - atomic compiled CSS-in-JS</td><tr>
  <tr><td>1</td><td>styles - keep jss</td><tr>
  <tr><td>1</td><td>styles - remove JSS</td><tr>
  <tr><th>25</th><th>typescript</th><tr>
  <tr><td>19</td><td>typescript - ?</td><tr>
  <tr><td>3</td><td>typescript - docs</td><tr>
  <tr><td>3</td><td>typescript - faster check</td><tr>
  <tr><th>21</th><th>date picker - improve</th><tr>
  <tr><th>19</th><th>react native</th><tr>
  <tr><th>13</th><th>form</th><tr>
  <tr><th>13</th><th>material design updates</th><tr>
  <tr><th>12</th><th>animations</th><tr>
  <tr><td>8</td><td>animations - ?</td><tr>
  <tr><td>2</td><td>animations - docs</td><tr>
  <tr><td>1</td><td>animations - declarative API</td><tr>
  <tr><td>1</td><td>animations - SVG</td><tr>
  <tr><th>11</th><th>test</th><tr>
  <tr><td>4</td><td>test - jest</td><tr>
  <tr><td>3</td><td>test - stable snapshot</td><tr>
  <tr><td>1</td><td>test - ?</td><tr>
  <tr><td>1</td><td>test - docs</td><tr>
  <tr><td>1</td><td>test - styles</td><tr>
  <tr><td>1</td><td>test - testing library integration</td><tr>
  <tr><th>8</th><th>more opinionated</th><tr>
  <tr><th>8</th><th>simplify</th><tr>
  <tr><th>7</th><th>class components</th><tr>
  <tr><th>7</th><th>mobile</th><tr>
  <tr><th>7</th><th>fewer breaking changes</th><tr>
  <tr><th>7</th><th>designers</th><tr>
  <tr><td>2</td><td>designers - bridge design tools and code</td><tr>
  <tr><td>2</td><td>designers - Adobe XD material</td><tr>
  <tr><td>2</td><td>designers - Figma material</td><tr>
  <tr><td>1</td><td>designers - ?</td><tr>
  <tr><th>6</th><th>free vs paid balance</th><tr>
  <tr><th>6</th><th>tree view - improve</th><tr>
  <tr><th>6</th><th>less abstracted components</th><tr>
  <tr><th>5</th><th>more abstracted components</th><tr>
  <tr><th>4</th><th>accessibility</th><tr>
  <tr><td>1</td><td>accessibility - ?</td><tr>
  <tr><td>1</td><td>accessibility - auto id</td><tr>
  <tr><td>1</td><td>accessibility - full audit</td><tr>
  <tr><td>1</td><td>accessibility - more examples</td><tr>
  <tr><th>4</th><th>system</th><tr>
  <tr><td>1</td><td>system - CSS grid</td><tr>
  <tr><td>1</td><td>system - docs</td><tr>
  <tr><td>1</td><td>system - performance</td><tr>
  <tr><td>1</td><td>system - rework breakpoints</td><tr>
  <tr><th>3</th><th>components consistency</th><tr>
  <tr><th>3</th><th>grid - improve</th><tr>
</table>

<!-- vale MUI.CorrectReferenceAllCases = YES -->

### Comparison with last year

There are a couple of noticeable differences compared to last year.
Some can be explained by our work, others by the evolution of the ecosystem.
Each item is prefixed by the multiplication factor of the pain point for 2020 relative to 2019.

Decreasing pain:

- x0: Slider. No requests. The requirements are mostly met, especially with the introduction of the range feature.
- x0.1: Strict mode. We fixed a lot of strict mode compatibility issues this year. However, since Create React App has made this mode a default, we have seen a lot more requests for it.
- x0.1: Autocomplete. We added a new component, and have resolved a large number of issues opened since. This will be moved from lab to the core in v5.
- x0.2: Fewer breaking changes. Only releasing minor versions under v4 for over a year helps a lot. However, we still need to be careful with CSS changes.
- x0.3: Accessibility. We have been able to leverage GitHub issues opened by a11y experts, often coming from large companies using Material UI at scale to improve it a lot this year.
- x0.4: Material Design. We didn't do much for it this year, at least not as much as we could have. Maybe the reduction is because fewer people care? It seems that we start to resonate more with developers building custom design systems.
- x0.4: TypeScript. The continued migration of all the demos to TypeScript and of all the props to IntelliSense is paying off.
- x0.5: Date picker. We did a lot for it this year. We probably still need the range feature, and to move it into the main repository (docs migration, etc.) for consistency.
- x0.7: Performance. We didn't do much this year, so perhaps developers are leveraging React more effectively with virtualization, update pruning, etc?

Growing pains:

- ∞: Forms is a new item. It seems that we should at least work more closely with react-hook-form, formik, and react-final-form.
- ∞: Charts is a new item. Material Design even has a page dedicated to [date visualization](https://m2.material.io/design/communication/data-visualization.html).
- x5: Custom themes.
- x5: Simpler customization. We have improved customizability this year by introducing global class names and reducing the CSS specificity of some selectors. However, it seems that we are now tapping into a new audience. We need to do better.
- x1.5: Animations.
- x1.2: React native. We still have no plans for it. The [market is too small](https://npm-stat.com/charts.html?package=react-dom,react-native) to make it sustainable with our model.
- x1.1: More components. The more we offer, the more developers ask for! We will try to help solve this with the enterprise version, both because it's the best model we have found that can sustain the development of advanced components, and because it allows us to reinvest in the open source components. The first early access will land this year.

### 6. What are your key criteria when choosing a UI library?

<img src="/static/blog/2020-survey/6.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 21.99% The design, look & feel, 21.64% Documentation quality, 16.38% Customizability, 8.42% TypeScript integration, 6.89% Comprehensiveness, 5.35% Enterprise ready, 4.68% Bundle size, 4.92% Popularity, 4.45% Accessibility, 2.62% Documentation quality, 1.88% Offered support & help, 0.12% Performance, 0.67% Other." />

The number of answers was limited to 3.

## About you

### 7. How did you hear about Material UI?

<img src="/static/blog/2020-survey/7.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 50.65% Search, 26.18% Word of mouth, 10.76% Social, 5.10% Blog, 7.31% Other." />

### 8. Which of the following best describes your current job role?

<img src="/static/blog/2020-survey/8.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 52.18% Full-stack developer, 27.11% Frontend developer, 11.65% Entrepreneur (I do it all), 3.47% Beginner learning web development, 1.23% Backend Developer, 1.16% UX Designer, 0.34% Student, 0.20% CTO, 2.66% Other." />

This was expected :)

### 9. How big is your organization?

<img  src="/static/blog/2020-survey/9.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 12.30% Hobby / side project, 13.40% Self-employed, 35.60% 2-5 people, 16.10% 6-10, 10.30% 11-20, 5.10% 21-50, 2.50% 51-100, 4.60% 100+" />

It seems we are consistently popular with small to medium-sized organizations, so we will keep working on the ease of use of the components, while at the same time, allowing designers to style them to match their organizations' brand.

### 10. How long have you been developing with JavaScript

<img src="/static/blog/2020-survey/10.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 3.60% I'm just getting started!, 7.40% 6 months +, 20.80% 1 year +, 27.80% 3 years +, 24.30% 5 years +, 9.80% 10 years +, 4.10% 15 years +, 2.30% 20 years +" />

We can see the normal distribution of developer experience here, where most have moderate level of experience (between 1 and 5 years).

### 11. How long have you been developing with React?

<img src="/static/blog/2020-survey/11.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 10.70% I'm just getting started!, 15.60% 6 months +, 24.60% 1 year +, 21.40% 2 years +, 23.10% 3 years +, 4.60% Bleeding edge baby! 5 years +" />

### 12. How long have you been developing with Material UI?

<img src="/static/blog/2020-survey/12.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 20.50% I'm just getting started!, 24.90% 6 months +, 28% 1 year +, 17.40% 2 years +, 7.50% 3 years +, 1.70% I'm a pioneer! 4 years +" />

### 13. What were you primarily using before Material UI?

<img src="/static/blog/2020-survey/13.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 47.08% Bootstrap, 16.04% Custom system, 13.68% Started with Material UI, 6.67% Angular Material, 4.44% Semantic-UI, 3.19% Ant Design, 8.89% Other" />

Similar to last year, it seems that most respondents were previously using Bootstrap. We can see also that custom solutions, as well as some other frameworks, were replaced with Material UI.

### 14. How many Material UI based projects have you built?

<img src="/static/blog/2020-survey/14.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 11.50% 0 (I'm just getting started), 23% 1, 54.80% 2-5, 7.80% 6-10, 2.90% 10+" />

## Your product

### 15. What are you building?

<img src="/static/blog/2020-survey/15.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 23.43% Enterprise application, 20.31% Dashboard admin app, 7.40% A design system, 7.40% A set of UI components, 7.37% playing with tech, 7.34% A prototype, 6.40% Landing page, 5.41% e-commerce site, 4.80% CMS, 3.59% Portfolio or resume, 1.88% Blog, 4.69% Other" />

Enterprises and dashboards are at the top of the heap, and yes, we know that for many of you, the systems you are building are internal, but if you have something that you would like to share as part of [the showcase](/material-ui/discover-more/showcase/), let us know by opening a PR. Also for those of you building UI components, we'd be happy to give you a shout out in the [related projects](/material-ui/discover-more/related-projects/)
section.

### 16. What "delivery mechanism" are you using?

<img src="/static/blog/2020-survey/16.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 68.37% Single page app (Create React App, etc), 18.24% Server-side rendered website (Next.js, Gatsby, etc), 6.22% Desktop app (Electron, etc), 4.65% Native mobile app (Cordova, etc), 0.10% React Native, 2.40% Other" />

### 17. Who are you building it for?

<img src="/static/blog/2020-survey/17.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Pie chart: 55.17% For my company
22.86% For a client, 16.94% Side project, 5.03% More than one of these." />

### 18. Which JavaScript framework are you using, if any?

<img src="/static/blog/2020-survey/18.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Pie chart: 57.34% Create React App, 16.40% Custom Webpack, 12.35% Next.js, 5.40% Gatsby, 8.51% Other." />

### 19. What styling system are you using?

<img src="/static/blog/2020-survey/19.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Pie chart: 53.84% Material UI styles (JSS), 20.41% Styled components, 13.01% Good plain CSS, 8.31% CSS Modules, 1.96% Emotion, 0.59% scss, 0.59% sass, 0.09% less, 1.19% Other" />

The response seems to be similar to the one from the last year's survey, so we will push with better support for styled components.

### 20. Has your organization ever paid for UI components?

<img src="/static/blog/2020-survey/20.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Pie chart: 89.90% No, 10.10% Yes" />

### 21. What type system are you using?

<img src="/static/blog/2020-survey/21.png" style="width: 796px; margin-top: 16px; margin-bottom: 8px;" alt="Bar chart: 54.08% None
30.87% TypeScript 3.8, 7.31% TypeScript 3.7, 1.90% Flow, 1.55% TypeScript 3.6, 0.98% TypeScript 3.5, 3.31% Other" />

Almost half of the community is using TypeScript. Next year, it might even become more popular than JavaScript.

## Conclusion

This data is **incredibly valuable** for our team.
Thank you again for participating!
We want to work on the problems that resonate the most with our users.
[It's clear](#5-how-can-we-improve-material-ui-for-you) that we should:

1. Provide more flexibility on the components, unstyled components (pure hooks?).
1. Make the customization easier and implement custom themes with Material UI. Maybe provide a theme builder.
1. Provide a second theme, update the current components to better match Material Design, provide more simple components and features (for example dropzone, carousel) as well as provide a better DX (there are good ideas from other UI libraries to apply to Material UI v5).
1. Improve upon the paid advanced versions of the components (for example complex data grid, date range picker, tree view drag & drop, virtualization, etc).

**We will update [our ROADMAP](/material-ui/discover-more/roadmap/) in the coming days**.
We will run a similar survey next year to keep track of our progress.

If you want to continue to influence our roadmap, please upvote 👍 the issues you are the most interested in on GitHub.

<img src="/static/blog/2019-developer-survey-results/vote.gif" style="width: 550px; margin-bottom: 8px;" alt="How to upvote on GitHub" />
<p class="blog-description">Help us prioritize by upvoting.</p>

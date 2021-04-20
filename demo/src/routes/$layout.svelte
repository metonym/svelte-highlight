<script>
  import "carbon-components-svelte/css/all.css";
  import "../app.css";
  import {
    Grid,
    Row,
    Column,
    Content,
    Tabs,
    Tab,
    TabContent,
  } from "carbon-components-svelte";
  import Usage from "$lib/Usage.svelte";
  import Languages from "$lib/Languages.svelte";
  import Styles from "$lib/Styles.svelte";

  let selected = 0;
</script>

<Content style="background: none; padding: 0">
  <Grid padding>
    <Row>
      <Column>
        <h2 class="mb-5">svelte-highlight</h2>
      </Column>
    </Row>

    <Row>
      <Column noGutter>
        <Tabs bind:selected>
          <Tab label="Usage" />
          <Tab label="Languages" />
          <Tab label="Styles" />
          <div slot="content">
            <Grid as fullWidth let:props>
              <TabContent {...props}>
                <Usage active="{selected === 0}" />
              </TabContent>
              <TabContent {...props}>
                <Languages />
              </TabContent>
              <TabContent {...props}>
                <Styles />
              </TabContent>
            </Grid>
          </div>
        </Tabs>
      </Column>
    </Row>
  </Grid>
</Content>

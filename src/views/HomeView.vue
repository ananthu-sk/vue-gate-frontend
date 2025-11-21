<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { initialEdges, initialNodes } from '../assets/initial-flow.js'
import Icon from '../components/Icon.vue'
import CustomTransformNode from '@/components/CustomTransformNode.vue'
import CustomInputNode from '@/components/CustomInputNode.vue'
import CustomOutputNode from '@/components/CustomOutputNode.vue'

/**
 * `useVueFlow` provides:
 * 1. a set of methods to interact with the VueFlow instance (like `fitView`, `setViewport`, `addEdges`, etc)
 * 2. a set of event-hooks to listen to VueFlow events (like `onInit`, `onNodeDragStop`, `onConnect`, etc)
 * 3. the internal state of the VueFlow instance (like `nodes`, `edges`, `viewport`, etc)
 */
const { onInit, onConnect, addEdges, setViewport, toObject, getConnectedEdges } = useVueFlow()

const nodes = ref(initialNodes)

const edges = ref(initialEdges)

// our dark mode toggle flag
const dark = ref(true)

/**
 * This is a Vue Flow event-hook which can be listened to from anywhere you call the composable, instead of only on the main component
 * Any event that is available as `@event-name` on the VueFlow component is also available as `onEventName` on the composable and vice versa
 *
 * onInit is called when the VueFlow viewport is initialized
 */
onInit((vueFlowInstance) => {
  // instance is the same as the return of `useVueFlow`
  vueFlowInstance.fitView()
})

/**
 * onConnect is called when a new connection is created.
 *
 * You can add additional properties to your new edge (like a type or label) or block the creation altogether by not calling `addEdges`
 */
onConnect((connection) => {
  addEdges(connection)
})

/**
 * To update a node or multiple nodes, you can
 * 1. Mutate the node objects *if* you're using `v-model`
 * 2. Use the `updateNode` method (from `useVueFlow`) to update the node(s)
 * 3. Create a new array of nodes and pass it to the `nodes` ref
 */
function updatePos() {
  nodes.value = nodes.value.map((node) => {
    return {
      ...node,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    }
  })
}

/**
 * toObject transforms your current graph data to an easily persist-able object
 */
function logToObject() {
  console.log(toObject())
}

/**
 * Resets the current viewport transformation (zoom & pan)
 */
function resetTransform() {
  setViewport({ x: 0, y: 0, zoom: 1 })
}

function toggleDarkMode() {
  dark.value = !dark.value
}

function removeEdge({ edge }) {
  edges.value = edges.value.filter((e) => e.id !== edge.id)
}

let transformationNodeNumber = 2

function addNode() {
  const id = Date.now().toString()
  transformationNodeNumber += 1

  nodes.value.push({
    id,
    position: { x: 400, y: 500 },
    type: 'custom-transform',
    data: {
      content: `Transform ${transformationNodeNumber}`,
      code: `def transform${transformationNodeNumber}(row: dict) -> dict:
    logger.info(f"before :: row :: {row}")
    for key in row:
        if key.startswith("channel_"):
            row[key] += 10
    logger.info(f"after :: row :: {row}")
    return row
  `,
    },
  })
}

function removeNode({ node }) {
  const edgesConnected = getConnectedEdges(node.id)
  edges.value = edges.value.filter((e) => !edgesConnected.find((ec) => e.id === ec.id))

  nodes.value = nodes.value.filter((n) => n.id !== node.id)
}
</script>

<template>
  <VueFlow
    v-model="nodes"
    :edges="edges"
    :class="{ dark }"
    class="basic-flow"
    :default-viewport="{ zoom: 1 }"
    :min-zoom="0.2"
    :max-zoom="4"
    @edge-double-click="removeEdge"
    @node-double-click="removeNode"
  >
    <Panel position="top-right">
      <button class="uk-button uk-button-primary uk-button-small" type="button" @click="addNode">
        Add a node
      </button>
    </Panel>

    <template #node-custom-input="props">
      <CustomInputNode :id="props.id" :data="props.data" />
    </template>

    <template #node-custom-output="props">
      <CustomOutputNode :id="props.id" :data="props.data" />
    </template>

    <template #node-custom-transform="props">
      <CustomTransformNode :id="props.id" :data="props.data" />
    </template>

    <Background pattern-color="#aaa" :gap="16" />

    <MiniMap />

    <Controls position="top-left">
      <ControlButton title="Reset Transform" @click="resetTransform">
        <Icon name="reset" />
      </ControlButton>

      <ControlButton title="Shuffle Node Positions" @click="updatePos">
        <Icon name="update" />
      </ControlButton>

      <ControlButton title="Toggle Dark Mode" @click="toggleDarkMode">
        <Icon v-if="dark" name="sun" />
        <Icon v-else name="moon" />
      </ControlButton>

      <ControlButton title="Log `toObject`" @click="logToObject">
        <Icon name="log" />
      </ControlButton>
    </Controls>
  </VueFlow>
</template>

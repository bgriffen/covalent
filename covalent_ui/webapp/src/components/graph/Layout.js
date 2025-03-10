/**
 * Copyright 2021 Agnostiq Inc.
 *
 * This file is part of Covalent.
 *
 * Licensed under the GNU Affero General Public License 3.0 (the "License").
 * A copy of the License may be obtained with this software package or at
 *
 *      https://www.gnu.org/licenses/agpl-3.0.en.html
 *
 * Use of this file is prohibited except in compliance with the License. Any
 * modifications or derivative works of this file must retain this copyright
 * notice, and modified files must contain a notice indicating that they have
 * been altered from the originals.
 *
 * Covalent is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * Relief from the License may be granted by purchasing a commercial license.
 */

import _ from 'lodash'
import dagre from 'dagre'
import { isNode } from 'react-flow-renderer'

import { isParameter } from '../../utils/misc'
import theme from '../../utils/theme'

const layout = (graph, direction = 'TB', showParams = true) => {
  const elements = mapGraphToElements(graph, direction, showParams)
  assignNodePositions(elements, direction)

  return elements
}

/**
 * Filter graph by node type.
 */
const filterGraph = (graph, nodePredicate) => {
  const nodes = _.filter(graph.nodes, nodePredicate)
  const nodeSet = new Set(_.map(nodes, 'id'))
  const links = _.filter(graph.links, ({ source }) => nodeSet.has(source))
  return { nodes, links }
}

/**
 * Map Covalent graph nodes and links to ReactFlow graph elements.
 */
const mapGraphToElements = (graph, direction, showParams) => {
  if (!showParams) {
    graph = filterGraph(graph, (node) => !isParameter(node))
  }

  const nodes = _.map(graph.nodes, (node) => {
    const { inputs, outputs } = countEdges(node.id, graph.links)
    const handlePositions = getHandlePositions(direction)
    const isParam = isParameter(node)

    const name = isParam ? _.trim(node.name, ':parameter:') : node.name

    return {
      id: String(node.id),
      type: isParam ? 'parameter' : 'electron',
      data: {
        fullName: name,
        label: _.truncate(name, { length: 70 }),
        status: node.status,
        inputs,
        outputs,
      },
      targetPosition: handlePositions.target,
      sourcePosition: handlePositions.source,
    }
  })

  const edges = _.map(graph.links, (edge) => {
    const { source, target } = edge
    return {
      id: `${source}-${target}`,
      source: String(source),
      target: String(target),
      label: edge.edge_name,
      type: 'directed',
    }
  })

  return [...nodes, ...edges]
}

// node width is used by the layout engine to avoid node overlap
const fontSize = theme.typography.fontSize
const lineHeight = theme.typography.body1.lineHeight * fontSize

const nodeWidth = (name) => _.size(name) * fontSize
const nodeHeight = lineHeight

const edgeWidth = (name) => _.size(name) * fontSize
const edgeHeight = lineHeight

const assignNodePositions = (elements, direction) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 75,
    ranksep: 100,
  })

  _.each(elements, (el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, {
        width: nodeWidth(el.data.label),
        height: nodeHeight,
      })
    } else {
      dagreGraph.setEdge(el.source, el.target, {
        width: edgeWidth(el.label),
        height: edgeHeight,
      })
    }
  })

  dagre.layout(dagreGraph)

  _.each(elements, (e) => {
    if (isNode(e)) {
      const node = dagreGraph.node(e.id)
      e.position = {
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
      }
    }
  })
}

/**
 * Returns source and target handle positions.
 *
 * @param {direction} 'LR'|'RL'|'TB'|'BT'
 *
 * @returns { source: <position>, target: <position> }
 */
const getHandlePositions = (direction) => {
  switch (direction) {
    case 'TB':
      return { source: 'bottom', target: 'top' }
    case 'BT':
      return { source: 'top', target: 'bottom' }
    case 'RL':
      return { source: 'left', target: 'right' }
    case 'LR':
      return { source: 'right', target: 'left' }

    default:
      throw new Error(`Illegal direction: ${direction}`)
  }
}

const countEdges = (nodeId, edges) => {
  return _.reduce(
    edges,
    (res, edge) => {
      if (edge.source === nodeId) {
        res.outputs++
      }
      if (edge.target === nodeId) {
        res.inputs++
      }
      return res
    },
    { inputs: 0, outputs: 0 }
  )
}

export default layout

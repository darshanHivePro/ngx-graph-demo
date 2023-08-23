import { Layout } from '@swimlane/ngx-graph';
import { Graph } from '@swimlane/ngx-graph';
import { Node } from '@swimlane/ngx-graph';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';
import { Edge } from '@swimlane/ngx-graph';
import { Observable, Subject } from 'rxjs';
// import { of } from 'rxjs';
// import { delay } from 'rxjs/operators';

import { NodePosition } from '@swimlane/ngx-graph';

export interface D3ForceDirectedSettings {
  force?: any;
  forceLink?: any;
}
export interface D3Node {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fx?: number;
  fy?: number;
}
export interface D3Edge {
  source: string | D3Node;
  target: string | D3Node;
  midPoint: NodePosition;
}
export interface D3Graph {
  nodes: D3Node[];
  edges: D3Edge[];
}
export interface MergedNode extends D3Node, Node {
  id: string;
}

export function toD3Node(maybeNode: string | D3Node): D3Node {
  if (typeof maybeNode === 'string') {
    return {
      id: maybeNode,
      x: 0,
      y: 0,
      fy: 100,
    };
  }
  maybeNode.fy = 100;
  return maybeNode;
}

export class D3ForceDirectedLayout implements Layout {
  defaultSettings: D3ForceDirectedSettings = {
    force: forceSimulation<any>()
      .force('charge', forceManyBody().strength(100))
      .force('collide', forceCollide(50)),
    forceLink: forceLink<any, any>()
      .id((node) => node.id)
      .distance(() => 100),
  };
  settings: D3ForceDirectedSettings = {};

  inputGraph: Graph;
  outputGraph: Graph;
  d3Graph: D3Graph;
  outputGraph$: Subject<Graph> = new Subject();

  draggingStart: { x: number; y: number };

  run(graph: Graph): Observable<Graph> {
    this.inputGraph = graph;
    this.d3Graph = {
      nodes: [...this.inputGraph.nodes.map((n) => ({ ...n }))] as any,
      edges: [...this.inputGraph.edges.map((e) => ({ ...e }))] as any,
    };
    this.outputGraph = {
      nodes: [],
      edges: [],
      edgeLabels: [],
    };
    this.outputGraph$.next(this.outputGraph);
    this.settings = Object.assign({}, this.defaultSettings, this.settings);
    // if (this.settings.force) {
    //   this.settings.force
    //     .nodes(this.d3Graph.nodes)
    //     .force('link', this.settings.forceLink.links(this.d3Graph.edges))
    //     .alpha(0.5)
    //     .restart()
    //     .on('tick', () => {
    //       this.outputGraph$.next(this.d3GraphToOutputGraph(this.d3Graph));
    //     });
    // }

    if (this.settings.force) {
      this.settings.force
        .nodes(this.d3Graph.nodes)
        .force('link', this.settings.forceLink.links(this.d3Graph.edges))
        .tick(this.d3Graph.nodes.length * this.d3Graph.nodes.length)
        .stop();
      this.outputGraph$.next(this.d3GraphToOutputGraph(this.d3Graph));
    }

    // return of(this.d3GraphToOutputGraph(this.d3Graph)).pipe(delay(500));
    // return Observable.of(this.d3GraphToOutputGraph(this.d3Graph)).delay(500);

    return this.outputGraph$.asObservable();
  }

  updateEdge(graph: Graph, edge: Edge): Observable<Graph> {
    const settings = Object.assign({}, this.defaultSettings, this.settings);
    if (settings.force) {
      settings.force
        .nodes(this.d3Graph.nodes)
        .force('link', settings.forceLink.links(this.d3Graph.edges))
        .alpha(0.5)
        .restart()
        .on('tick', () => {
          this.outputGraph$.next(this.d3GraphToOutputGraph(this.d3Graph));
        });
    }

    return this.outputGraph$.asObservable();
  }

  d3GraphToOutputGraph(d3Graph: D3Graph): Graph {
    this.outputGraph.nodes = this.d3Graph.nodes.map((node: MergedNode) => ({
      ...node,
      id: node.id || id(),
      position: {
        x: node.x,
        y: node.y,
      },
      dimension: {
        width: (node.dimension && node.dimension.width) || 20,
        height: (node.dimension && node.dimension.height) || 20,
      },
      transform: `translate(${
        node.x - ((node.dimension && node.dimension.width) || 20) / 2 || 0
      }, ${
        node.y - ((node.dimension && node.dimension.height) || 20) / 2 || 0
      })`,
    }));

    this.outputGraph.edges = this.d3Graph.edges.map((edge) => ({
      ...edge,
      source: toD3Node(edge.source).id,
      target: toD3Node(edge.target).id,
      points: [
        {
          x: toD3Node(edge.source).x,
          y: toD3Node(edge.source).y,
        },
        {
          x: toD3Node(edge.target).x,
          y: toD3Node(edge.target).y,
        },
      ],
    }));

    this.outputGraph.edgeLabels = this.outputGraph.edges;
    return this.outputGraph;
  }

  onDragStart(draggingNode: Node, $event: MouseEvent): void {
    this.settings.force.alphaTarget(0.3).restart();
    const node = this.d3Graph.nodes.find(
      (d3Node) => d3Node.id === draggingNode.id
    );
    if (!node) {
      return;
    }
    this.draggingStart = { x: $event.x - node.x, y: $event.y - node.y };
    node.fx = $event.x - this.draggingStart.x;
    node.fy = $event.y - this.draggingStart.y;
  }

  onDrag(draggingNode: Node, $event: MouseEvent): void {
    if (!draggingNode) {
      return;
    }
    const node = this.d3Graph.nodes.find(
      (d3Node) => d3Node.id === draggingNode.id
    );
    if (!node) {
      return;
    }
    node.fx = $event.x - this.draggingStart.x;
    node.fy = $event.y - this.draggingStart.y;
  }

  onDragEnd(draggingNode: Node, $event: MouseEvent): void {
    if (!draggingNode) {
      return;
    }
    const node = this.d3Graph.nodes.find(
      (d3Node) => d3Node.id === draggingNode.id
    );
    if (!node) {
      return;
    }

    this.settings.force.alphaTarget(0);
    node.fx = undefined;
    node.fy = undefined;
  }
}

const cache = {};
export function id(): string {
  let newId = (
    '0000' + ((Math.random() * Math.pow(36, 4)) << 0).toString(36)
  ).slice(-4);

  newId = `a${newId}`;

  // ensure not already used
  if (!cache[newId]) {
    cache[newId] = true;
    return newId;
  }

  return id();
}

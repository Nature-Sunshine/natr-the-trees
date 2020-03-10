import {
  AfterContentChecked,
  AfterViewChecked,
  AfterViewInit,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {GraphComponent} from '@swimlane/ngx-graph';
import {Store} from '@ngrx/store';
import {TreeState} from './+state/reducers/tree.reducer';
import {TreeNodeModel} from './models/tree-node.model';
import {TreeEdgeModel} from './models/tree-edge.model';
import {TreeModel} from './models/tree.model';
import {Subject} from 'rxjs';

import * as lo from 'lodash';
import {HistorianService, Logging} from '@natr/historian';

@Logging
@Component({
  selector: 'lib-the-trees',
  templateUrl: 'the-trees.component.html',
  styleUrls: ['the-trees.component.scss']
})
export class TheTreesComponent implements OnInit, AfterViewInit, AfterViewChecked, AfterContentChecked, OnChanges {
  @ContentChild('linkTemplate') linkTemplate: TemplateRef<any>;
  @ContentChild('nodeTemplate') nodeTemplate: TemplateRef<any>;
  @ContentChild('clusterTemplate') clusterTemplate: TemplateRef<any>;
  @ContentChild('defsTemplate') defsTemplate: TemplateRef<any>;

  @ViewChild('graphComponent') graphComponent: GraphComponent;
  @ViewChildren(GraphComponent) graphChildren: QueryList<GraphComponent>;

  @Input() tree: TreeModel;
  @Input() viewDimensions: number[] = [400, 800];
  @Input() zoomToFit$: Subject<boolean> = new Subject<boolean>();
  @Input() layoutSettings = {
    orientation: 'TB'
  };


  links: TreeEdgeModel[];
  nodes: TreeNodeModel[];
  gotData = false;

  private logger: HistorianService;

  constructor(private store: Store<{ tree: TreeState }>) {
  }

  ngOnInit() {
    if (this.tree) {
      this.gotData = true;
      this.nodes = lo.cloneDeep(this.tree.nodes);
      this.links = lo.cloneDeep(this.tree.edges);
    }
    this.zoomToFit$.next(true);
    this.store.select(state => state && state.tree)
      .subscribe(
        tree => {
          this.logger.debug(`ngOnInit store sub tree`, tree);
          if (tree && tree.treeData) {
            this.nodes = lo.cloneDeep(tree.treeData.nodes);
            this.links = lo.cloneDeep(tree.treeData.edges);
            this.gotData = true;
          }
        }
      );
  }

  ngAfterViewInit() {
    this.setComponents();
    this.logger.debug(`.ngAfterViewInit graphComponent in after view`, this.graphComponent);
    this.logger.debug(`.ngAfterViewInit graphChildren`, this.graphChildren);
    this.logger.debug(`.ngAfterViewInit nodeTemplate`, this.nodeTemplate);
    this.logger.debug(`.ngAfterViewInit linkTemplate`, this.linkTemplate);
    this.logger.debug(`.ngAfterViewInit clusterTemplate`, this.clusterTemplate);
    this.logger.debug(`.ngAfterViewInit defsTemplate`, this.defsTemplate);
    this.graphChildren.changes.subscribe((thing) => {
      this.logger.debug(`${TheTreesComponent.name}.ngAfterViewInit children change thing is `, thing);
      this.setComponents();
    });
  }

  private setComponents() {
    if (this.graphComponent) {
      if (this.nodeTemplate) {
        this.graphComponent.nodeTemplate = this.nodeTemplate;
      }
      if (this.linkTemplate) {
        this.graphComponent.linkTemplate = this.linkTemplate;
      }
      if (this.clusterTemplate) {
        this.graphComponent.clusterTemplate = this.clusterTemplate;
      }
      if (this.defsTemplate) {
        this.graphComponent.defsTemplate = this.defsTemplate;
      }
    }
  }

  changeLayout(): void {
    if (this.layoutSettings.orientation === 'TB') {
      this.layoutSettings = {...this.layoutSettings, orientation: 'BT'};
    } else {
      this.layoutSettings = {...this.layoutSettings, orientation: 'TB'};
    }

    this.logger.debug(`${TheTreesComponent.name}.changeLayout layoutSettings`, this.layoutSettings);
  }

  ngAfterViewChecked(): void {

  }

  ngAfterContentChecked(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.logger.debug(`${TheTreesComponent.name}.ngOnChanges`, changes);
    this.zoomToFit$.next(true);
  }
}

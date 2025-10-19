import"./chunk-34NHXPZT.js";import"./chunk-RB5VR4FE.js";import{b as re}from"./chunk-4FVNHDHZ.js";import{a as oe}from"./chunk-KSA57TVO.js";import{Da as Z,Ea as q,Fa as z,Ga as H,Ha as W,Ka as j,La as J,Ma as K,Oa as X,Pa as Y,Qb as ne,Rb as ie,Wa as ee,X as M,Ya as te,na as G,oa as Q,ra as U}from"./chunk-HSKCSBWS.js";import"./chunk-XX3OU7O5.js";import"./chunk-P5LOYQB2.js";import"./chunk-HEI3NBOD.js";import{n as P}from"./chunk-KV5YFX3I.js";import"./chunk-FPPZ4BUR.js";import"./chunk-QHBPP6FM.js";import{Ac as s,Fc as e,Ic as B,Pb as I,Qb as f,Rb as C,Sb as F,Tc as E,Ub as $,Vb as k,Wb as a,Xb as i,Yb as t,Zb as c,cb as r,dc as g,ed as b,fb as w,hc as S,id as O,la as d,ma as u,nc as v,pd as L,qc as x,rb as N,va as D,xb as _,yc as R,zc as A}from"./chunk-7GBT3Z6V.js";import"./chunk-ZOGHMS73.js";var le=["stepTpl"],V=()=>({$implicit:1}),ce=()=>({$implicit:2});function me(o,p){o&1&&g(0)}function se(o,p){o&1&&g(0)}function de(o,p){o&1&&g(0)}function ue(o,p){if(o&1){let n=S();e(0,`
              `),i(1,"button",17),v("click",function(){d(n),x();let l=s(24);return u(l.reset())}),e(2,"Reset"),t(),e(3,`
            `)}}function xe(o,p){if(o&1){let n=S();e(0,`
                `),i(1,"button",18),v("click",function(){d(n),x(2);let l=s(24);return u(l.prev())}),e(2,"Prev"),t(),e(3,`
              `)}}function _e(o,p){if(o&1){let n=S();e(0,`
                `),i(1,"button",19),v("click",function(){d(n),x(2);let l=s(24);return u(l.next())}),e(2,"Next"),t(),e(3,`
              `)}}function fe(o,p){if(o&1){let n=S();e(0,`
                `),i(1,"button",20),v("click",function(){d(n),x(2);let l=s(24);return u(l.finish())}),e(2,"Finish"),t(),e(3,`
              `)}}function Ce(o,p){if(o&1&&(e(0,`
              `),f(1,xe,4,0),f(2,_e,4,0),f(3,fe,4,0)),o&2){x();let n=s(24);r(),C(n.activeStepIndex()>0?1:-1),r(),C(n.activeStepIndex()<n.stepsCount()-1?2:-1),r(),C(n.activeStepIndex()===n.stepsCount()-1?3:-1)}}function Se(o,p){o&1&&e(0,`
                All steps have been completed.
              `)}function ve(o,p){if(o&1&&e(0),o&2){x();let n=s(24);B(`
                current step: `,n.activeStepIndex()+1," / ",n.stepsCount(),`
              `)}}function ye(o,p){if(o&1&&(e(0,`
                `),c(1,"c-stepper-step",21),e(2,`
              `)),o&2){let n=p.$implicit;r(),a("label",n)}}function ge(o,p){o&1&&g(0)}function Ee(o,p){if(o&1&&(e(0,`
                `),i(1,"c-stepper-step",21),e(2,`
                  `),_(3,ge,1,0,"ng-container",11),e(4,`
                `),t(),e(5,`
              `)),o&2){let n=p.$implicit;r(),a("label",n.label),r(2),a("ngTemplateOutlet",n.template)("ngTemplateOutletContext",E(3,ce))}}function be(o,p){if(o&1&&(i(0,"form",22)(1,"c-row",23)(2,"c-col",24)(3,"label",25),e(4,"First name"),t(),c(5,"input",26),t(),i(6,"c-col",24)(7,"label",25),e(8,"Last name"),t(),c(9,"input",26),t(),i(10,"c-col",24)(11,"label",25),e(12,"Username"),t(),i(13,"c-input-group")(14,"span",27),e(15,"@"),t(),c(16,"input",28),t()()()()),o&2){let n=p.$implicit;r(2),a("md",4),r(),a("for",`userFirstName-0${n}`),r(2),a("id",`userFirstName-0${n}`),r(),a("md",4),r(),a("for",`userLastName-0${n}`),r(2),a("id",`userLastName-0${n}`),r(),a("md",4),r(),a("for",`userName-0${n}`),r(3),a("id",`basic-addon-0${n}`),r(2),a("id",`userName-0${n}`),I("aria-describedby",`basic-addon-0${n}`)}}function he(o,p){if(o&1&&(i(0,"form",22)(1,"c-row",23)(2,"c-col",24)(3,"label",25),e(4,"City"),t(),c(5,"input",26),t(),i(6,"c-col",24)(7,"label",25),e(8,"State"),t(),i(9,"select",29)(10,"option"),e(11,"Choose..."),t(),i(12,"option",30),e(13,"..."),t()()(),i(14,"c-col",24)(15,"label",25),e(16,"Zip"),t(),c(17,"input",26),t()()()),o&2){let n=p.$implicit;r(2),a("md",6),r(),a("for",`userCity-0${n}`),r(2),a("id",`userCity-0${n}`),r(),a("md",3),r(),a("for",`userState-0${n}`),r(2),a("id",`userState-0${n}`),r(5),a("md",3),r(),a("for",`userZip-0${n}`),r(2),a("id",`userZip-0${n}`)}}function Te(o,p){if(o&1&&(i(0,"form",22)(1,"c-row",31)(2,"c-col",24)(3,"label",25),e(4,"Email"),t(),c(5,"input",32),t(),i(6,"c-col",24)(7,"label",25),e(8,"Password"),t(),c(9,"input",33),t(),i(10,"c-col")(11,"c-form-check"),c(12,"input",34),i(13,"label",35),e(14,"Agree to terms and conditions"),t()()()()()),o&2){let n=p.$implicit;r(2),a("md",6),r(),a("for",`userEmail-0${n}`),r(2),a("id",`userEmail-0${n}`),r(),a("md",6),r(),a("for",`userPassword-0${n}`),r(2),a("id",`userPassword-0${n}`),r(3),a("id",`userAgree-0${n}`),r(),a("for",`userAgree-0${n}`)}}var y=class y{constructor(){this.finished=D(!1);this.labels=["Step 1","Step 2","Step 3"];this.stepTemplates=L("stepTpl",{read:w});this.steps=O(()=>this.stepTemplates().map((n,m)=>({label:`Step ${m+1}`,template:n})))}handleReset(){console.log("- handleReset"),this.finished.set(!1)}handleFinish(p){console.log("- handleFinish",p),this.finished.set(p)}};y.\u0275fac=function(n){return new(n||y)},y.\u0275cmp=N({type:y,selectors:[["app-steppers"]],viewQuery:function(n,m){n&1&&R(m.stepTemplates,le,5,w),n&2&&A()},decls:131,vars:11,consts:[["stepper",""],["step1","","stepTpl",""],["step2","","stepTpl",""],["step3","","stepTpl",""],["xs","12"],["href","forms/stepper/"],[1,"mb-4"],[1,"text-body-secondary","small"],[1,"bg-body","border","rounded","p-3"],[3,"finished","onReset"],["label","Step 1"],[4,"ngTemplateOutlet","ngTemplateOutletContext"],["label","Step 2"],["href","forms/stepper/#vertical-indicator"],["stepButtonLayout","vertical"],["href","forms/stepper/#vertical-layout"],["layout","vertical"],["cButton","","color","danger",3,"click"],["cButton","","color","secondary",3,"click"],["cButton","","color","primary",3,"click"],["color","warning","cButton","",3,"click"],[3,"label"],["cForm",""],[1,"g-3","pb-5"],[3,"md"],["cLabel","",3,"for"],["cFormControl","",3,"id"],["cInputGroupText","",3,"id"],["aria-label","Username","autocomplete","off","cFormControl","","placeholder","Username",3,"id"],["aria-label","State select","cSelect","",3,"id"],["value","1"],[1,"g-3","pb-1"],["cFormControl","","type","email","autocomplete","email",3,"id"],["autocomplete","new-password","cFormPassword","",3,"id"],["cFormCheckInput","","required","","type","checkbox",3,"id"],["cFormCheckLabel","",3,"for"]],template:function(n,m){if(n&1){let l=S();i(0,"c-row"),e(1,`
  `),i(2,"c-col",4),e(3,`
    `),c(4,"app-docs-components",5),e(5,`
    `),i(6,"c-card",6),e(7,`
      `),i(8,"c-card-header"),e(9,`
        `),i(10,"strong"),e(11,"Angular Stepper Component"),t(),e(12,`
      `),t(),e(13,`
      `),i(14,"c-card-body"),e(15,`
        `),i(16,"p",7),e(17,`
          The Angular Stepper component helps you build intuitive, multi-step form experiences (Form Wizards) for your Angular applications. It supports horizontal and vertical layouts, built-in form validation, custom indicators, and seamless integration with any Angular forms.
        `),t(),e(18,`
        `),i(19,"app-docs-example",5),e(20,`
          `),i(21,"div",8),e(22,`
            `),i(23,"c-stepper",9,0),v("finished",function(T){return d(l),u(m.handleFinish(T))})("onReset",function(){return d(l),u(m.handleReset())}),e(25,`
              `),i(26,"c-stepper-step",10),e(27,`
                `),_(28,me,1,0,"ng-container",11),e(29,`
              `),t(),e(30,`
              `),i(31,"c-stepper-step",12),e(32,`
                `),_(33,se,1,0,"ng-container",11),e(34,`
              `),t(),e(35,`
              `),i(36,"c-stepper-step",12),e(37,`
                `),_(38,de,1,0,"ng-container",11),e(39,`
              `),t(),e(40,`
            `),t(),e(41,`
            `),c(42,"hr"),e(43,`
            `),f(44,ue,4,0)(45,Ce,4,3),c(46,"hr"),e(47,`
            `),i(48,"p"),e(49,`
              `),f(50,Se,1,0)(51,ve,1,2),t(),e(52,`
          `),t(),e(53,`
        `),t(),e(54,`
      `),t(),e(55,`
    `),t(),e(56,`
    `),i(57,"c-card",6),e(58,`
      `),i(59,"c-card-header"),e(60,`
        `),i(61,"strong"),e(62,"Angular Stepper Component"),t(),e(63," "),i(64,"small"),e(65,"Vertical indicator"),t(),e(66,`
      `),t(),e(67,`
      `),i(68,"c-card-body"),e(69,`
        `),i(70,"p",7),e(71,`
          Display step indicators vertically above the labels using the `),i(72,"code"),e(73,'stepButtonLayout="vertical"'),t(),e(74,` prop.
        `),t(),e(75,`
        `),i(76,"app-docs-example",13),e(77,`
          `),i(78,"div",8),e(79,`
            `),i(80,"c-stepper",14),e(81,`
              `),$(82,ye,3,1,null,null,F),t(),e(84,`
          `),t(),e(85,`
        `),t(),e(86,`
      `),t(),e(87,`
    `),t(),e(88,`
    `),i(89,"c-card",6),e(90,`
      `),i(91,"c-card-header"),e(92,`
        `),i(93,"strong"),e(94,"Angular Stepper Component"),t(),e(95," "),i(96,"small"),e(97,"Vertical indicator"),t(),e(98,`
      `),t(),e(99,`
      `),i(100,"c-card-body"),e(101,`
        `),i(102,"p",7),e(103,`
          By using the `),i(104,"code"),e(105,'layout="vertical"'),t(),e(106," prop, both the step indicators and the step content are stacked vertically. This layout is ideal for mobile devices or designs where vertical flow is preferred in a top-to-bottom progression. "),t(),e(107,`
        `),i(108,"app-docs-example",15),e(109,`
          `),i(110,"div",8),e(111,`
            `),i(112,"c-stepper",16),e(113,`
              `),$(114,Ee,6,4,null,null,F),t(),e(116,`
          `),t(),e(117,`
        `),t(),e(118,`
      `),t(),e(119,`
    `),t(),e(120,`
  `),t(),e(121,`
`),t(),_(122,be,17,11,"ng-template",null,1,b)(125,he,18,9,"ng-template",null,2,b)(128,Te,15,8,"ng-template",null,3,b)}if(n&2){let l=s(24),h=s(123),T=s(126),pe=s(129);r(28),a("ngTemplateOutlet",h)("ngTemplateOutletContext",E(8,V)),r(5),a("ngTemplateOutlet",T)("ngTemplateOutletContext",E(9,V)),r(5),a("ngTemplateOutlet",pe)("ngTemplateOutletContext",E(10,V)),r(6),C(l.finishing()?44:45),r(6),C(l.finishing()?50:51),r(32),k(m.labels),r(32),k(m.steps())}},dependencies:[ie,ne,M,te,ee,j,H,X,K,J,z,W,q,Z,P,Y,Q,G,U,oe,re],encapsulation:2});var ae=y;export{ae as SteppersComponent};

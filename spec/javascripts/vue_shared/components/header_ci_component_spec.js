import Vue from 'vue';
import headerCi from '~/vue_shared/components/header_ci_component.vue';
import mountComponent from 'spec/helpers/vue_mount_component_helper';

describe('Header CI Component', () => {
  let HeaderCi;
  let vm;
  let props;

  beforeEach(() => {
    HeaderCi = Vue.extend(headerCi);
    props = {
      status: {
        group: 'failed',
        icon: 'status_failed',
        label: 'failed',
        text: 'failed',
        details_path: 'path',
      },
      itemName: 'job',
      itemId: 123,
      time: '2017-05-08T14:57:39.781Z',
      user: {
        web_url: 'path',
        name: 'Foo',
        username: 'foobar',
        email: 'foo@bar.com',
        avatar_url: 'link',
      },
      actions: [
        {
          label: 'Retry',
          path: 'path',
          type: 'button',
          cssClass: 'btn',
          isLoading: false,
        },
        {
          label: 'Go',
          path: 'path',
          type: 'link',
          cssClass: 'link',
          isLoading: false,
        },
      ],
      hasSidebarButton: true,
    };
  });

  afterEach(() => {
    vm.$destroy();
  });

  describe('render', () => {
    beforeEach(() => {
      vm = mountComponent(HeaderCi, props);
    });

    it('should render status badge', () => {
      expect(vm.$el.querySelector('.ci-failed')).toBeDefined();
      expect(vm.$el.querySelector('.ci-status-icon-failed svg')).toBeDefined();
      expect(
        vm.$el.querySelector('.ci-failed').getAttribute('href'),
      ).toEqual(props.status.details_path);
    });

    it('should render item name and id', () => {
      expect(vm.$el.querySelector('strong').textContent.trim()).toEqual('job #123');
    });

    it('should render timeago date', () => {
      expect(vm.$el.querySelector('time')).toBeDefined();
    });

    it('should render user icon and name', () => {
      expect(vm.$el.querySelector('.js-user-link').textContent.trim()).toEqual(props.user.name);
    });

    it('should render provided actions', () => {
      expect(vm.$el.querySelector('.btn').tagName).toEqual('BUTTON');
      expect(vm.$el.querySelector('.btn').textContent.trim()).toEqual(props.actions[0].label);
      expect(vm.$el.querySelector('.link').tagName).toEqual('A');
      expect(vm.$el.querySelector('.link').textContent.trim()).toEqual(props.actions[1].label);
      expect(vm.$el.querySelector('.link').getAttribute('href')).toEqual(props.actions[0].path);
    });

    it('should show loading icon', (done) => {
      vm.actions[0].isLoading = true;

      Vue.nextTick(() => {
        expect(vm.$el.querySelector('.btn .fa-spinner').getAttribute('style')).toBeFalsy();
        done();
      });
    });

    it('should render sidebar toggle button', () => {
      expect(vm.$el.querySelector('.js-sidebar-build-toggle')).toBeDefined();
    });
  });

  describe('shouldRenderTriggeredLabel', () => {
    it('should rendered created keyword when the shouldRenderTriggeredLabel is false', () => {
      vm = mountComponent(HeaderCi, { ...props, shouldRenderTriggeredLabel: false });

      expect(vm.$el.textContent).toContain('created');
      expect(vm.$el.textContent).not.toContain('triggered');
    });
  });
});

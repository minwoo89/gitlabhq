# frozen_string_literal: true

module Mutations
  module Todos
    class RestoreMany < ::Mutations::Todos::Base
      graphql_name 'TodoRestoreMany'

      MAX_UPDATE_AMOUNT = 50

      argument :ids,
               [::Types::GlobalIDType[::Todo]],
               required: true,
               description: 'The global ids of the todos to restore (a maximum of 50 is supported at once)'

      field :updated_ids, [GraphQL::ID_TYPE],
            null: false,
            description: 'The ids of the updated todo items',
            deprecated: { reason: 'Use todos', milestone: '13.2' }

      field :todos, [::Types::TodoType],
            null: false,
            description: 'Updated todos'

      def resolve(ids:)
        check_update_amount_limit!(ids)

        todos = authorized_find_all_pending_by_current_user(model_ids_of(ids))
        updated_ids = restore(todos)

        {
            updated_ids: gids_of(updated_ids),
            todos: Todo.id_in(updated_ids),
            errors: errors_on_objects(todos)
        }
      end

      private

      def gids_of(ids)
        ids.map { |id| Gitlab::GlobalId.as_global_id(id, model_name: Todo.name).to_s }
      end

      def model_ids_of(ids)
        ids.map do |gid|
          # TODO: remove this line when the compatibility layer is removed
          # See: https://gitlab.com/gitlab-org/gitlab/-/issues/257883
          gid = ::Types::GlobalIDType[::Todo].coerce_isolated_input(gid)
          gid.model_id.to_i
        end.compact
      end

      def raise_too_many_todos_requested_error
        raise Gitlab::Graphql::Errors::ArgumentError, 'Too many todos requested.'
      end

      def check_update_amount_limit!(ids)
        raise_too_many_todos_requested_error if ids.size > MAX_UPDATE_AMOUNT
      end

      def errors_on_objects(todos)
        todos.flat_map { |todo| errors_on_object(todo) }
      end

      def authorized_find_all_pending_by_current_user(ids)
        return Todo.none if ids.blank? || current_user.nil?

        Todo.for_ids(ids).for_user(current_user).done
      end

      def restore(todos)
        TodoService.new.restore_todos(todos, current_user)
      end
    end
  end
end

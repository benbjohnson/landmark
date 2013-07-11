class CreateActions < ActiveRecord::Migration
  def up
    create_table(:actions) do |t|
      t.references :project
      t.string :name
    end

    execute "create index on actions using gin(to_tsvector('english', name));"
  end

  def down
    drop_table(:actions)
  end
end

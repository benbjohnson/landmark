class CreateActions < ActiveRecord::Migration
  def up
    create_table(:actions) do |t|
      t.references :account
      t.string :name
    end
  end

  def down
    drop_table(:actions)
  end
end

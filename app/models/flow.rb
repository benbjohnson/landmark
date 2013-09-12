class Flow < ActiveRecord::Base
  belongs_to :project
  validates :name, presence: true, uniqueness: true
  has_many :steps, :class_name => 'FlowStep', :dependent => :destroy

  attr_accessible :name

  # Generates a funnel analysis query to be run against Sky.
  def query(options={})
    root = {sessionIdleTime:7200, steps:[]}

    parent = root
    steps.each_with_index do |step, index|
      condition = {
        :type => 'condition',
        :expression => "resource == #{step.resource.to_s.to_lua} && action == '__page_view__'",
        :within => (index == 0 ? [0,0] : [1, 1000000]),
        :steps => [
          {:type => 'selection',
           :name => index.to_s,
           :dimensions => [],
           :fields => [:name => 'count', :expression => 'count()']},]}
      parent[:steps] << condition
      parent = condition
    end

    return root
  end
end
